/**
 * pointsService.ts — Server-side points, level, and ledger logic.
 *
 * Level thresholds mirror ecoLogic.ts exactly (single source of truth here).
 * The frontend ecoLogic.ts is kept intact for offline/demo mode only.
 */
import mongoose from 'mongoose';
import { User } from '../models/User';
import { PointsLedger, LedgerEventType } from '../models/PointsLedger';
import { Types } from 'mongoose';

// ── Level thresholds (matches frontend ecoLogic.ts) ───────────────────────
export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Seedling Steward',  minPoints: 0,    maxPoints: 100 },
  { level: 2, title: 'Sprout Guardian',   minPoints: 100,  maxPoints: 250 },
  { level: 3, title: 'Foliage Protector', minPoints: 250,  maxPoints: 500 },
  { level: 4, title: 'Canopy Guardian',   minPoints: 500,  maxPoints: 900 },
  { level: 5, title: 'Earth Champion',    minPoints: 900,  maxPoints: 1500 },
  { level: 6, title: 'Planetary Shield',  minPoints: 1500, maxPoints: 3000 },
] as const;

export interface UserLevelInfo {
  level: number;
  title: string;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
}

export function calculateUserLevel(points: number): UserLevelInfo {
  const safePoints = Math.max(0, points);
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const tier = LEVEL_THRESHOLDS[i];
    if (safePoints >= tier.minPoints) {
      const span = tier.maxPoints - tier.minPoints;
      const progress =
        span > 0
          ? Math.min(100, Math.round(((safePoints - tier.minPoints) / span) * 100))
          : 100;
      return {
        level: tier.level,
        title: tier.title,
        currentLevelPoints: safePoints - tier.minPoints,
        nextLevelPoints: tier.maxPoints,
        progressPercent: progress,
      };
    }
  }
  return {
    level: 1,
    title: 'Seedling Steward',
    currentLevelPoints: safePoints,
    nextLevelPoints: 100,
    progressPercent: Math.min(100, safePoints),
  };
}

/**
 * Atomically award (or deduct) points to a user and write a ledger entry.
 *
 * Uses findOneAndUpdate with $inc for atomic balance update.
 * idempotencyKey uniqueness prevents double-processing on retry.
 *
 * @returns the new balance or throws on duplicate key (already processed)
 */
export async function awardPoints(opts: {
  userId: Types.ObjectId;
  pointsDelta: number;            // positive = earn, negative = spend
  eventType: LedgerEventType;
  referenceId: string;
  description: string;
  impactDetails?: string;
  idempotencyKey: string;
  session?: mongoose.ClientSession;
}): Promise<{ newBalance: number }> {
  const {
    userId, pointsDelta, eventType, referenceId,
    description, impactDetails = '', idempotencyKey, session,
  } = opts;

  // Step 1: Atomically update user balance (prevents negative balance for spends)
  const filter =
    pointsDelta < 0
      ? { _id: userId, points: { $gte: -pointsDelta } } // ensure sufficient balance
      : { _id: userId };

  const updatedUser = await User.findOneAndUpdate(
    filter,
    { $inc: { points: pointsDelta } },
    { new: true, session }
  );

  if (!updatedUser) {
    throw Object.assign(
      new Error('Insufficient points balance or user not found.'),
      { statusCode: 400 }
    );
  }

  const newBalance = updatedUser.points;

  // Step 2: Write ledger entry (idempotencyKey unique index prevents duplicates)
  await PointsLedger.create(
    [
      {
        userId,
        eventType,
        referenceId,
        pointsDelta,
        balanceAfter: newBalance,
        description,
        impactDetails,
        idempotencyKey,
      },
    ],
    { session }
  );

  return { newBalance };
}
