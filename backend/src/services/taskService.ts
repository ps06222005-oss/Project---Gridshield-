/**
 * taskService.ts — Server-side task completion logic.
 *
 * Documented Timezone Policy:
 *   - The user's configured timezone (from User/UserSettings, default 'Asia/Kolkata')
 *     is used to calculate calendar day boundaries for daily task resets and streaks.
 *   - Exact completion timestamps (`completedAt`) are always stored in standard UTC.
 *   - One-time tasks (`isDaily === false`) remain strictly one-time and are never eligible
 *     for daily resets.
 */
import mongoose, { Types } from 'mongoose';
import { Task } from '../models/Task';
import { TaskCompletion } from '../models/TaskCompletion';
import { User } from '../models/User';
import { awardPoints } from './pointsService';
import { evaluateAndUnlockBadges } from './badgeService';
import { updateStreak } from './userService';
import { HttpError } from '../middleware/errorHandler';

/**
 * Returns date string "YYYY-MM-DD" for a date in the user's configured timezone.
 * Falls back safely to UTC if the timezone string is invalid.
 */
export function getUserLocalDateString(
  date: Date = new Date(),
  timezone: string = 'Asia/Kolkata'
): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Legacy alias for backwards compatibility */
export const utcDateString = (date: Date = new Date()) => date.toISOString().slice(0, 10);

export interface CompleteTaskResult {
  pointsAwarded: number;
  newBalance: number;
  badgesUnlocked: string[];
  completedAt: Date;
}

export async function completeTask(
  userId: Types.ObjectId,
  taskSlug: string,
  verificationNote = ''
): Promise<CompleteTaskResult> {
  // 1. Fetch user to obtain configured timezone
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, 'User not found.');
  const userTimezone = user.timezone || 'Asia/Kolkata';

  // 2. Fetch the task definition
  const task = await Task.findOne({ taskId: taskSlug, isActive: true });
  if (!task) throw new HttpError(404, `Task not found: ${taskSlug}`);

  // 3. Compute calendar date in user's timezone
  const today = getUserLocalDateString(new Date(), userTimezone);

  // 4. Check for duplicate completion based on recurrence rule
  if (task.isDaily) {
    const existing = await TaskCompletion.findOne({
      userId,
      taskSlug,
      completedDate: today,
    });
    if (existing) {
      throw new HttpError(409, 'Task already completed today. Resets at midnight in your timezone!');
    }
  } else {
    // One-time task — check all-time history
    const existing = await TaskCompletion.findOne({ userId, taskSlug });
    if (existing) {
      throw new HttpError(409, 'This task is a one-time achievement and has already been completed.');
    }
  }

  // 5. Build unique idempotency key
  const idempotencyKey = task.isDaily
    ? `${userId}:task_completed:${taskSlug}:${today}`
    : `${userId}:task_completed:${taskSlug}:once`;

  const session = await mongoose.startSession();
  let result: CompleteTaskResult;

  try {
    await session.withTransaction(async () => {
      const now = new Date();

      // 4. Write completion record
      await TaskCompletion.create(
        [
          {
            userId,
            taskId: task._id,
            taskSlug,
            completedDate: today,
            completedAt: now,
            verificationNote: verificationNote.slice(0, 500),
            pointsAwarded: task.points,
            co2SavedKg: task.co2SavedKg,
            energySavedKwh: task.energySavedKwh,
            waterSavedL: task.waterSavedL,
          },
        ],
        { session }
      );

      // 5. Award points (atomic)
      const impactParts: string[] = [];
      if (task.co2SavedKg > 0) impactParts.push(`${task.co2SavedKg}kg CO₂e`);
      if (task.energySavedKwh > 0) impactParts.push(`${task.energySavedKwh}kWh`);

      const { newBalance } = await awardPoints({
        userId,
        pointsDelta: task.points,
        eventType: 'task_completed',
        referenceId: taskSlug,
        description: `Completed: ${task.title}`,
        impactDetails: impactParts.join(' • '),
        idempotencyKey,
        session,
      });

      // 6. Update cumulative impact stats
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            co2AvoidedKg: task.co2SavedKg,
            energySavedKwh: task.energySavedKwh,
            waterConservedL: task.waterSavedL,
          },
        },
        { session }
      );

      // 7. Increment global task counter
      await Task.findByIdAndUpdate(
        task._id,
        { $inc: { globalCompletedCount: 1 } },
        { session }
      );

      // 8. Update streak
      await updateStreak(userId, session);

      // 9. Check badges (outside strict transaction to avoid lock contention)
      const totalCompleted = await TaskCompletion.countDocuments({ userId }).session(session);
      const totalLessons = 0; // quizAttempt service handles this
      const badgesUnlocked = await evaluateAndUnlockBadges(
        userId,
        { totalTasksCompleted: totalCompleted, totalLessonsCompleted: totalLessons },
        session
      );

      result = { pointsAwarded: task.points, newBalance, badgesUnlocked, completedAt: now };
    });
  } finally {
    await session.endSession();
  }

  return result!;
}

/** Returns the set of task slugs completed today by this user in their configured timezone */
export async function getCompletedTodaySlugs(userId: Types.ObjectId): Promise<string[]> {
  const user = await User.findById(userId).select('timezone');
  const userTimezone = user?.timezone || 'Asia/Kolkata';
  const today = getUserLocalDateString(new Date(), userTimezone);
  const completions = await TaskCompletion.find({ userId, completedDate: today }).select('taskSlug');
  return completions.map((c) => c.taskSlug);
}

/** Returns the set of task slugs ever completed by this user */
export async function getCompletedEverSlugs(userId: Types.ObjectId): Promise<string[]> {
  const completions = await TaskCompletion.find({ userId }).select('taskSlug').distinct('taskSlug');
  return completions;
}
