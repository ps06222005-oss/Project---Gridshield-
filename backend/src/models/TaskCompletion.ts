/**
 * TaskCompletion.ts — Records each time a user completes a task.
 *
 * Daily uniqueness is enforced by the compound unique index:
 *   { userId, taskId, completedDate }
 *
 * completedDate is stored as a UTC "YYYY-MM-DD" string so that
 * day-boundary comparisons are timezone-independent.
 *
 * Timezone policy: The backend always uses UTC for date arithmetic.
 * The frontend sends the user's local date (YYYY-MM-DD) in the request
 * body; the backend ignores it and derives completedDate from UTC clock.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITaskCompletion extends Document {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  taskSlug: string;            // denormalized for fast lookups without join
  completedDate: string;       // UTC "YYYY-MM-DD"
  completedAt: Date;           // exact UTC timestamp
  verificationNote: string;    // self-reported note (may be empty)
  pointsAwarded: number;
  co2SavedKg: number;
  energySavedKwh: number;
  waterSavedL: number;
}

const TaskCompletionSchema = new Schema<ITaskCompletion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    taskSlug: { type: String, required: true },
    completedDate: { type: String, required: true },  // "YYYY-MM-DD" UTC
    completedAt: { type: Date, required: true, default: Date.now },
    verificationNote: { type: String, default: '', maxlength: 500 },
    pointsAwarded: { type: Number, required: true, min: 0 },
    co2SavedKg: { type: Number, default: 0 },
    energySavedKwh: { type: Number, default: 0 },
    waterSavedL: { type: Number, default: 0 },
  },
  { timestamps: false }
);

// ── Critical: prevents duplicate daily completions ─────────────────────────
TaskCompletionSchema.index(
  { userId: 1, taskSlug: 1, completedDate: 1 },
  { unique: true, name: 'unique_daily_task_completion' }
);

// For querying user task history
TaskCompletionSchema.index({ userId: 1, completedAt: -1 });
TaskCompletionSchema.index({ userId: 1, completedDate: 1 });

export const TaskCompletion = mongoose.model<ITaskCompletion>(
  'TaskCompletion',
  TaskCompletionSchema
);
