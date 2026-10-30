/**
 * PointsLedger.ts — Auditable record of every point earning or spending event.
 *
 * Rules:
 *  - pointsDelta > 0: earning event
 *  - pointsDelta < 0: spending event (reward redemption)
 *  - idempotencyKey must be globally unique — prevents duplicate awards
 *  - The User.points field is the running balance; ledger is the audit trail
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type LedgerEventType =
  | 'task_completed'
  | 'quiz_completed'
  | 'reward_redeemed'
  | 'badge_bonus'
  | 'streak_bonus';

export interface IPointsLedger extends Document {
  userId: Types.ObjectId;
  eventType: LedgerEventType;
  referenceId: string;         // taskId | lessonId | rewardId | badgeId slug
  pointsDelta: number;         // positive = earned, negative = spent
  balanceAfter: number;        // user's balance immediately after this event
  description: string;
  impactDetails: string;       // e.g. "0.6kg CO₂e • 0.8kWh"
  idempotencyKey: string;      // unique per event — format: {userId}:{eventType}:{referenceId}:{date}
  createdAt: Date;
}

const PointsLedgerSchema = new Schema<IPointsLedger>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ['task_completed', 'quiz_completed', 'reward_redeemed', 'badge_bonus', 'streak_bonus'],
    },
    referenceId: { type: String, required: true },
    pointsDelta: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    impactDetails: { type: String, default: '' },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PointsLedgerSchema.index({ userId: 1, createdAt: -1 });
PointsLedgerSchema.index({ userId: 1, eventType: 1 });

export const PointsLedger = mongoose.model<IPointsLedger>('PointsLedger', PointsLedgerSchema);
