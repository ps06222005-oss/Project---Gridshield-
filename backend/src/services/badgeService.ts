/**
 * badgeService.ts — Server-side badge evaluation and unlock logic.
 *
 * Badge criteria exactly mirror evaluateBadgesProgress() from ecoLogic.ts.
 * Called after every task completion, quiz pass, reward redemption, and
 * streak update to check for newly earned badges.
 */
import mongoose, { Types } from 'mongoose';
import { Badge, IBadge } from '../models/Badge';
import { UserBadge } from '../models/UserBadge';
import { User, IUser } from '../models/User';
import { awardPoints } from './pointsService';

export interface BadgeProgress {
  badgeId: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  requirementDescription: string;
  currentProgress: number;
  targetProgress: number;
  bonusPoints: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

/** Compute current progress value for a badge given the user's stats */
function computeProgress(badge: IBadge, user: IUser): number {
  switch (badge.criterionType) {
    case 'tasks_completed_ever':
      // Fetched separately — passed in via userStats
      return 0; // overridden below in evaluateBadges
    case 'streak_days':
      return user.streakDays;
    case 'co2_kg':
      return Math.floor(user.co2AvoidedKg);
    case 'trees_planted':
      return user.treesPlanted;
    case 'energy_kwh':
      return Math.floor(user.energySavedKwh);
    case 'water_liters':
      return Math.floor(user.waterConservedL);
    case 'lessons_completed':
      return 0; // overridden below
    default:
      return 0;
  }
}

/**
 * Check all active badges, unlock any newly earned ones, and award bonus points.
 * Returns list of newly unlocked badge slugs.
 */
export async function evaluateAndUnlockBadges(
  userId: Types.ObjectId,
  extraStats: {
    totalTasksCompleted: number;
    totalLessonsCompleted: number;
  },
  session?: mongoose.ClientSession
): Promise<string[]> {
  const [user, badges, earnedBadges] = await Promise.all([
    User.findById(userId).session(session ?? null),
    Badge.find({ isActive: true }).session(session ?? null),
    UserBadge.find({ userId }).select('badgeSlug').session(session ?? null),
  ]);

  if (!user) return [];

  const earnedSlugs = new Set(earnedBadges.map((b) => b.badgeSlug));
  const newlyUnlocked: string[] = [];

  for (const badge of badges) {
    if (earnedSlugs.has(badge.badgeId)) continue; // already unlocked

    let progress = computeProgress(badge, user);

    // Override for externally computed stats
    if (badge.criterionType === 'tasks_completed_ever') {
      progress = extraStats.totalTasksCompleted;
    } else if (badge.criterionType === 'lessons_completed') {
      progress = extraStats.totalLessonsCompleted;
    }

    if (progress >= badge.criterionThreshold) {
      // Unlock the badge
      try {
        await UserBadge.create(
          [
            {
              userId,
              badgeId: badge._id,
              badgeSlug: badge.badgeId,
              unlockedAt: new Date(),
              bonusPointsAwarded: badge.bonusPoints,
            },
          ],
          { session }
        );

        // Award bonus points for the badge
        if (badge.bonusPoints > 0) {
          const ikey = `${userId.toString()}:badge_bonus:${badge.badgeId}:${Date.now()}`;
          await awardPoints({
            userId,
            pointsDelta: badge.bonusPoints,
            eventType: 'badge_bonus',
            referenceId: badge.badgeId,
            description: `Unlocked Badge: ${badge.title}`,
            idempotencyKey: ikey,
            session,
          });
        }

        newlyUnlocked.push(badge.badgeId);
      } catch (err: unknown) {
        // Duplicate key = race condition, badge already unlocked — safe to ignore
        if (
          typeof err === 'object' &&
          err !== null &&
          (err as { code?: number }).code === 11000
        ) {
          continue;
        }
        throw err;
      }
    }
  }

  return newlyUnlocked;
}

/** Get all badges with user's current progress and unlock status */
export async function getUserBadgeProgress(
  userId: Types.ObjectId,
  extraStats: { totalTasksCompleted: number; totalLessonsCompleted: number }
): Promise<BadgeProgress[]> {
  const [user, badges, earnedBadges] = await Promise.all([
    User.findById(userId),
    Badge.find({ isActive: true }),
    UserBadge.find({ userId }),
  ]);

  if (!user) return [];

  const earnedMap = new Map(
    earnedBadges.map((b) => [b.badgeSlug, b.unlockedAt])
  );

  return badges.map((badge) => {
    let progress = computeProgress(badge, user);
    if (badge.criterionType === 'tasks_completed_ever') {
      progress = extraStats.totalTasksCompleted;
    } else if (badge.criterionType === 'lessons_completed') {
      progress = extraStats.totalLessonsCompleted;
    }

    const isUnlocked = earnedMap.has(badge.badgeId) || progress >= badge.criterionThreshold;

    return {
      badgeId: badge.badgeId,
      title: badge.title,
      subtitle: badge.subtitle,
      icon: badge.icon,
      category: badge.category,
      requirementDescription: badge.requirementDescription,
      currentProgress: Math.min(badge.targetProgress, progress),
      targetProgress: badge.targetProgress,
      bonusPoints: badge.bonusPoints,
      isUnlocked,
      unlockedAt: earnedMap.get(badge.badgeId),
    };
  });
}
