/**
 * Lesson.ts — Learning lesson catalog (admin-managed seed data).
 *
 * IMPORTANT: quiz[].correctAnswerIndex is NEVER sent to the client.
 * It is used server-side only in quiz submission validation.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;  // SERVER-SIDE ONLY — stripped from API responses
  explanation: string;
}

export interface ILesson extends Document {
  lessonId: string;
  title: string;
  readTimeMinutes: number;
  category: string;
  summary: string;
  keyPoints: string[];
  content: string[];
  quiz: IQuizQuestion[];
  bonusPoints: number;
  isActive: boolean;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const LessonSchema = new Schema<ILesson>(
  {
    lessonId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    readTimeMinutes: { type: Number, default: 3, min: 1 },
    category: { type: String, required: true },
    summary: { type: String, default: '' },
    keyPoints: [{ type: String }],
    content: [{ type: String }],
    quiz: [QuizQuestionSchema],
    bonusPoints: { type: Number, default: 30, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LessonSchema.index({ category: 1, isActive: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
