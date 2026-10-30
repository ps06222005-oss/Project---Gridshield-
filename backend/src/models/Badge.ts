/**
 * Badge.ts — Badge definitions (admin-managed seed data).
 * Criteria exactly match the evaluateBadgesProgress() logic from ecoLogic.ts.
 */
import mongoose, { Document, Schema } from 'mongoose';

export type BadgeCriterionType =
  | 'tasks_completed_ever'
  | 'streak_days'
  | 'co2_kg'
  | 'trees_planted'
  | 'lessons_completed'
  | 'energy_kwh'
  | 'water_liters';

export interface IBadge extends Document {
  badgeId: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  requirementDescription: string;
  targetProgress: number;
  bonusPoints: number;
  criterionType: BadgeCriterionType;
  criterionThreshold: number;
  isActive: boolean;
}

const BadgeSchema = new Schema<IBadge>(
  {
    badgeId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '🏅' },
    category: { type: String, required: true },
    requirementDescription: { type: String, required: true },
    targetProgress: { type: Number, required: true, min: 1 },
    bonusPoints: { type: Number, required: true, min: 0 },
    criterionType: {
      type: String,
      required: true,
      enum: [
        'tasks_completed_ever',
        'streak_days',
        'co2_kg',
        'trees_planted',
        'lessons_completed',
        'energy_kwh',
        'water_liters',
      ],
    },
    criterionThreshold: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
