/**
 * Task.ts — Mongoose model for the eco-task catalog (admin-managed seed data).
 *
 * Tasks are either daily (recurring each calendar day) or one-time.
 * All 8 tasks from the frontend are daily habits.
 */
import mongoose, { Document, Schema } from 'mongoose';

export type TaskCategory = 'energy' | 'water' | 'waste' | 'food' | 'commute' | 'habits';
export type TaskDifficulty = 'Easy' | 'Medium' | 'Challenging';

export interface ITask extends Document {
  taskId: string;              // slug: "task-ac-temp"
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  points: number;
  impactLabel: string;
  co2SavedKg: number;
  energySavedKwh: number;
  waterSavedL: number;
  durationMinutes: number;
  description: string;
  whyItMatters: string;
  actionSteps: string[];
  isDaily: boolean;            // true = resets every calendar day
  isActive: boolean;
  globalCompletedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['energy', 'water', 'waste', 'food', 'commute', 'habits'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Challenging'],
    },
    points: { type: Number, required: true, min: 1 },
    impactLabel: { type: String, default: '' },
    co2SavedKg: { type: Number, default: 0, min: 0 },
    energySavedKwh: { type: Number, default: 0, min: 0 },
    waterSavedL: { type: Number, default: 0, min: 0 },
    durationMinutes: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    whyItMatters: { type: String, default: '' },
    actionSteps: [{ type: String }],
    isDaily: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    globalCompletedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

TaskSchema.index({ category: 1, isActive: 1 });
TaskSchema.index({ isActive: 1, difficulty: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
