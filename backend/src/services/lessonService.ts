/**
 * lessonService.ts — Lesson and quiz submission logic.
 *
 * Key rules:
 *  - correctAnswerIndex is NEVER included in responses to the client.
 *  - Bonus points are awarded only on the first passing attempt.
 *  - Quiz answers are validated entirely server-side.
 */
import mongoose, { Types } from 'mongoose';
import { Lesson } from '../models/Lesson';
import { QuizAttempt } from '../models/QuizAttempt';
import { awardPoints } from './pointsService';
import { evaluateAndUnlockBadges } from './badgeService';
import { TaskCompletion } from '../models/TaskCompletion';
import { HttpError } from '../middleware/errorHandler';

export interface QuizSubmitResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  bonusPointsAwarded: number;
  isFirstPass: boolean;
  newBalance?: number;
  badgesUnlocked: string[];
  results: { correct: boolean; explanation: string }[];
}

/** Grade a quiz and award points if first passing attempt */
export async function submitQuiz(
  userId: Types.ObjectId,
  lessonSlug: string,
  answers: number[]
): Promise<QuizSubmitResult> {
  const lesson = await Lesson.findOne({ lessonId: lessonSlug, isActive: true });
  if (!lesson) throw new HttpError(404, `Lesson not found: ${lessonSlug}`);

  if (answers.length !== lesson.quiz.length) {
    throw new HttpError(
      400,
      `Expected ${lesson.quiz.length} answers, received ${answers.length}.`
    );
  }

  // Server-side grading
  let correctCount = 0;
  const results = lesson.quiz.map((q, i) => {
    const correct = answers[i] === q.correctAnswerIndex;
    if (correct) correctCount++;
    return { correct, explanation: q.explanation };
  });

  const total = lesson.quiz.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
  const passed = score >= 60;

  // Check if this is the first passing attempt
  const previousPass = await QuizAttempt.findOne({
    userId,
    lessonSlug,
    isFirstPass: true,
  });
  const isFirstPass = passed && !previousPass;

  const bonusPointsAwarded = isFirstPass ? lesson.bonusPoints : 0;
  const idempotencyKey = `${userId}:quiz_completed:${lessonSlug}:${Date.now()}`;

  const session = await mongoose.startSession();
  let newBalance: number | undefined;
  let badgesUnlocked: string[] = [];

  try {
    await session.withTransaction(async () => {
      // Record the attempt
      await QuizAttempt.create(
        [
          {
            userId,
            lessonId: lesson._id,
            lessonSlug,
            answers,
            score,
            passed,
            correctCount,
            totalQuestions: total,
            bonusPointsAwarded,
            isFirstPass,
            submittedAt: new Date(),
            idempotencyKey,
          },
        ],
        { session }
      );

      // Award bonus points on first pass
      if (isFirstPass && bonusPointsAwarded > 0) {
        const result = await awardPoints({
          userId,
          pointsDelta: bonusPointsAwarded,
          eventType: 'quiz_completed',
          referenceId: lessonSlug,
          description: `Mastered: ${lesson.title} Quiz`,
          impactDetails: `Scored ${score}%`,
          idempotencyKey,
          session,
        });
        newBalance = result.newBalance;

        // Check badges
        const [totalCompleted, totalLessons] = await Promise.all([
          TaskCompletion.countDocuments({ userId }).session(session),
          QuizAttempt.countDocuments({ userId, isFirstPass: true }).session(session),
        ]);
        badgesUnlocked = await evaluateAndUnlockBadges(
          userId,
          { totalTasksCompleted: totalCompleted, totalLessonsCompleted: totalLessons },
          session
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return {
    score,
    passed,
    correctCount,
    total,
    bonusPointsAwarded,
    isFirstPass,
    newBalance,
    badgesUnlocked,
    results,
  };
}

/** Get completed lesson slugs for a user (first-pass only) */
export async function getCompletedLessonSlugs(userId: Types.ObjectId): Promise<string[]> {
  const attempts = await QuizAttempt.find({ userId, isFirstPass: true }).select('lessonSlug');
  return attempts.map((a) => a.lessonSlug);
}
