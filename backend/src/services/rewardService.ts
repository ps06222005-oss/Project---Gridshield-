/**
 * rewardService.ts — Reward redemption logic.
 * Points deduction and voucher generation are atomic.
 * Voucher codes are generated server-side only — never trusted from client.
 */
import mongoose, { Types } from 'mongoose';
import { Reward } from '../models/Reward';
import { RewardRedemption } from '../models/RewardRedemption';
import { User } from '../models/User';
import { awardPoints } from './pointsService';
import { evaluateAndUnlockBadges } from './badgeService';
import { HttpError } from '../middleware/errorHandler';
import { TaskCompletion } from '../models/TaskCompletion';
import { QuizAttempt } from '../models/QuizAttempt';

/** Generate a server-side voucher code: GRID-{CAT3}-{4digits} */
function generateVoucherCode(category: string): string {
  const cat = category.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `GRID-${cat}-${digits}`;
}

export interface RedemptionResult {
  voucherCode: string;
  rewardTitle: string;
  rewardSlug: string;
  pointsSpent: number;
  claimedAt: Date;
  newBalance: number;
  badgesUnlocked: string[];
}

export async function redeemReward(
  userId: Types.ObjectId,
  rewardSlug: string
): Promise<RedemptionResult> {
  const reward = await Reward.findOne({ rewardId: rewardSlug, isActive: true });
  if (!reward) throw new HttpError(404, `Reward not found: ${rewardSlug}`);

  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, 'User not found.');
  if (user.points < reward.costPoints) {
    throw new HttpError(
      400,
      `Insufficient points. You have ${user.points} pts but need ${reward.costPoints} pts.`
    );
  }

  const now = new Date();
  const voucherCode = generateVoucherCode(reward.category);
  const idempotencyKey = `${userId}:reward_redeemed:${rewardSlug}:${now.getTime()}`;

  const session = await mongoose.startSession();
  let result: RedemptionResult;

  try {
    await session.withTransaction(async () => {
      // 1. Deduct points atomically
      const { newBalance } = await awardPoints({
        userId,
        pointsDelta: -reward.costPoints,
        eventType: 'reward_redeemed',
        referenceId: rewardSlug,
        description: `Redeemed: ${reward.title}`,
        impactDetails: reward.impactMetric,
        idempotencyKey,
        session,
      });

      // 2. Write redemption record
      await RewardRedemption.create(
        [
          {
            userId,
            rewardId: reward._id,
            rewardSlug,
            voucherCode,
            pointsSpent: reward.costPoints,
            claimedAt: now,
            idempotencyKey,
          },
        ],
        { session }
      );

      // 3. Increment global claimed count
      await Reward.findByIdAndUpdate(
        reward._id,
        { $inc: { claimedCount: 1 } },
        { session }
      );

      // 4. Increment treesPlanted if applicable
      if (reward.category === 'Tree Planting') {
        await User.findByIdAndUpdate(userId, { $inc: { treesPlanted: 1 } }, { session });
      }

      // 5. Check for newly unlocked badges
      const [totalCompleted, totalLessons] = await Promise.all([
        TaskCompletion.countDocuments({ userId }).session(session),
        QuizAttempt.countDocuments({ userId, isFirstPass: true }).session(session),
      ]);

      const badgesUnlocked = await evaluateAndUnlockBadges(
        userId,
        { totalTasksCompleted: totalCompleted, totalLessonsCompleted: totalLessons },
        session
      );

      result = {
        voucherCode,
        rewardTitle: reward.title,
        rewardSlug,
        pointsSpent: reward.costPoints,
        claimedAt: now,
        newBalance,
        badgesUnlocked,
      };
    });
  } finally {
    await session.endSession();
  }

  return result!;
}

/** Get all vouchers claimed by a user */
export async function getUserVouchers(userId: Types.ObjectId) {
  return RewardRedemption.find({ userId }).sort({ claimedAt: -1 });
}
