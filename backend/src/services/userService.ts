/**
 * userService.ts — User profile creation/retrieval and streak management.
 *
 * Streak policy (documented):
 *   - Streak increments by 1 when lastActiveDate < today (UTC).
 *   - Streak resets to 1 if lastActiveDate < yesterday (UTC) — gap detected.
 *   - Streak is unchanged if lastActiveDate === today (already active today).
 */
import mongoose, { Types } from 'mongoose';
import { User, IUser } from '../models/User';
import { UserSettings } from '../models/UserSettings';
import { HttpError } from '../middleware/errorHandler';
import { getUserLocalDateString } from './taskService';

/** Find or create a user from a verified Firebase token */
export async function findOrCreateUser(opts: {
  firebaseUid: string;
  name: string;
  email?: string;
}): Promise<IUser> {
  const { firebaseUid, name } = opts;

  const user = await User.findOneAndUpdate(
    { firebaseUid },
    {
      $setOnInsert: {
        firebaseUid,
        name,
        hasOnboarded: false,
        points: 0,
        streakDays: 0,
        lastActiveDate: '',
        co2AvoidedKg: 0,
        energySavedKwh: 0,
        waterConservedL: 0,
        plasticBottlesAvoided: 0,
        treesPlanted: 0,
        notificationEnabled: true,
        dailyGoalPoints: 50,
        isDemo: false,
      },
    },
    { upsert: true, new: true }
  );

  // Ensure UserSettings document exists
  await UserSettings.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, notificationEnabled: true, dailyGoalPoints: 50 } },
    { upsert: true, new: true }
  );

  return user;
}

/** Get a user by their MongoDB _id, throwing 404 if not found */
export async function getUserById(userId: Types.ObjectId): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, 'User not found.');
  return user;
}

/** Get a user by their Firebase UID */
export async function getUserByFirebaseUid(uid: string): Promise<IUser | null> {
  return User.findOne({ firebaseUid: uid });
}

/** Allowed fields a user can update on their own profile */
export interface ProfileUpdatePayload {
  name?: string;
  location?: string;
  hasOnboarded?: boolean;
}

export async function updateUserProfile(
  userId: Types.ObjectId,
  payload: ProfileUpdatePayload
): Promise<IUser> {
  const allowed: (keyof ProfileUpdatePayload)[] = ['name', 'location', 'hasOnboarded'];
  const update: Partial<IUser> = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      (update as Record<string, unknown>)[key] = payload[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found.');
  return user;
}

/**
 * Update the user's daily streak based on user's configured timezone.
 * Called inside a transaction after any task completion.
 */
export async function updateStreak(
  userId: Types.ObjectId,
  session?: mongoose.ClientSession
): Promise<void> {
  const user = await User.findById(userId).session(session ?? null);
  if (!user) return;

  const tz = user.timezone || 'Asia/Kolkata';
  const today = getUserLocalDateString(new Date(), tz);
  const yesterday = getUserLocalDateString(new Date(Date.now() - 86_400_000), tz);

  if (user.lastActiveDate === today) return; // Already updated today

  const newStreak =
    user.lastActiveDate === yesterday
      ? user.streakDays + 1  // consecutive day
      : 1;                   // gap or first ever — reset

  await User.findByIdAndUpdate(
    userId,
    { lastActiveDate: today, streakDays: newStreak },
    { session }
  );
}

/** Safely delete a user and all associated private data */
export async function deleteUser(userId: Types.ObjectId): Promise<void> {
  const { TaskCompletion } = await import('../models/TaskCompletion');
  const { PointsLedger } = await import('../models/PointsLedger');
  const { UserBadge } = await import('../models/UserBadge');
  const { RewardRedemption } = await import('../models/RewardRedemption');
  const { QuizAttempt } = await import('../models/QuizAttempt');
  const { UserSettings } = await import('../models/UserSettings');

  await Promise.all([
    TaskCompletion.deleteMany({ userId }),
    PointsLedger.deleteMany({ userId }),
    UserBadge.deleteMany({ userId }),
    RewardRedemption.deleteMany({ userId }),
    QuizAttempt.deleteMany({ userId }),
    UserSettings.deleteOne({ userId }),
    User.findByIdAndDelete(userId),
  ]);
}
