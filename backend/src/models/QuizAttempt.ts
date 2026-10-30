/**
 * QuizAttempt.ts — Records each quiz submission.
 *
 * isFirstPass: only the first attempt that passes awards bonus points.
 * idempotencyKey prevents duplicate awards under retries.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  lessonSlug: string;
  answers: number[];           // user's submitted answer indices
  score: number;               // 0–100
  passed: boolean;             // score >= 60
  correctCount: number;
  totalQuestions: number;
  bonusPointsAwarded: number;  // 0 if not first pass
  isFirstPass: boolean;
  submittedAt: Date;
  idempotencyKey: string;      // unique: prevents double-award on retry
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    lessonSlug: { type: String, required: true },
    answers: [{ type: Number }],
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    correctCount: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 0 },
    bonusPointsAwarded: { type: Number, default: 0, min: 0 },
    isFirstPass: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: false }
);

QuizAttemptSchema.index({ userId: 1, lessonSlug: 1 });
QuizAttemptSchema.index({ userId: 1, submittedAt: -1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
