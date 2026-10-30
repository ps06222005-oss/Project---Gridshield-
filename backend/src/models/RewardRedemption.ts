/**
 * RewardRedemption.ts — Records each time a user redeems a reward.
 *
 * idempotencyKey prevents duplicate redemptions under retries.
 * voucherCode is generated server-side; clients never supply it.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRewardRedemption extends Document {
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  rewardSlug: string;          // denormalized reward.rewardId
  voucherCode: string;         // server-generated, unique
  pointsSpent: number;
  claimedAt: Date;
  idempotencyKey: string;      // unique: {userId}:redeem:{rewardSlug}:{timestamp}
}

const RewardRedemptionSchema = new Schema<IRewardRedemption>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rewardId: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    rewardSlug: { type: String, required: true },
    voucherCode: { type: String, required: true, unique: true },
    pointsSpent: { type: Number, required: true, min: 1 },
    claimedAt: { type: Date, required: true, default: Date.now },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: false }
);

RewardRedemptionSchema.index({ userId: 1, claimedAt: -1 });

export const RewardRedemption = mongoose.model<IRewardRedemption>(
  'RewardRedemption',
  RewardRedemptionSchema
);
