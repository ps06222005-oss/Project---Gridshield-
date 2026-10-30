/**
 * UserBadge.ts — Records when a user unlocks a badge.
 * Compound unique index prevents duplicate awards.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserBadge extends Document {
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  badgeSlug: string;           // denormalized badge.badgeId
  unlockedAt: Date;
  bonusPointsAwarded: number;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    badgeSlug: { type: String, required: true },
    unlockedAt: { type: Date, required: true, default: Date.now },
    bonusPointsAwarded: { type: Number, default: 0 },
  },
  { timestamps: false }
);

UserBadgeSchema.index(
  { userId: 1, badgeSlug: 1 },
  { unique: true, name: 'unique_user_badge' }
);

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
