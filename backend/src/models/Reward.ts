/**
 * Reward.ts — Reward catalog items (admin-managed seed data).
 */
import mongoose, { Document, Schema } from 'mongoose';

export type RewardCategory = 'Tree Planting' | 'Clean Energy' | 'Eco Gear' | 'Water Access';

export interface IReward extends Document {
  rewardId: string;
  title: string;
  organization: string;
  costPoints: number;
  category: RewardCategory;
  description: string;
  impactMetric: string;
  imageEmoji: string;
  claimedCount: number;
  isActive: boolean;
}

const RewardSchema = new Schema<IReward>(
  {
    rewardId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    costPoints: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      required: true,
      enum: ['Tree Planting', 'Clean Energy', 'Eco Gear', 'Water Access'],
    },
    description: { type: String, default: '' },
    impactMetric: { type: String, default: '' },
    imageEmoji: { type: String, default: '🎁' },
    claimedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RewardSchema.index({ category: 1, isActive: 1 });
RewardSchema.index({ costPoints: 1, isActive: 1 });

export const Reward = mongoose.model<IReward>('Reward', RewardSchema);
