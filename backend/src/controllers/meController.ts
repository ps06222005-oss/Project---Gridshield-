import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { findOrCreateUser, getUserByFirebaseUid, updateUserProfile, deleteUser } from '../services/userService';
import { User } from '../models/User';
import { PointsLedger } from '../models/PointsLedger';
import { TaskCompletion } from '../models/TaskCompletion';
import { QuizAttempt } from '../models/QuizAttempt';
import { UserBadge } from '../models/UserBadge';
import { UserSettings } from '../models/UserSettings';
import { RewardRedemption } from '../models/RewardRedemption';
import { calculateUserLevel } from '../services/pointsService';
import { getUserBadgeProgress } from '../services/badgeService';
import { getCompletedTodaySlugs, getCompletedEverSlugs } from '../services/taskService';
import { getCompletedLessonSlugs } from '../services/lessonService';
import { HttpError } from '../middleware/errorHandler';
import { UpdateSettingsSchema } from '../schemas';

async function resolveUser(req: Request) {
  const uid = req.user!.uid;
  let user = await getUserByFirebaseUid(uid);
  if (!user) {
    user = await findOrCreateUser({
      firebaseUid: uid,
      name: req.user!.name ?? 'Green Guardian',
      email: req.user!.email,
    });
  }
  return user;
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const levelInfo = calculateUserLevel(user.points);
    res.json({
      id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      location: user.location,
      points: user.points,
      streakDays: user.streakDays,
      lastActiveDate: user.lastActiveDate,
      co2AvoidedKg: user.co2AvoidedKg,
      energySavedKwh: user.energySavedKwh,
      waterConservedL: user.waterConservedL,
      plasticBottlesAvoided: user.plasticBottlesAvoided,
      treesPlanted: user.treesPlanted,
      notificationEnabled: user.notificationEnabled,
      dailyGoalPoints: user.dailyGoalPoints,
      hasOnboarded: user.hasOnboarded,
      level: levelInfo,
    });
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const updated = await updateUserProfile(user._id as Types.ObjectId, req.body);
    res.json({ name: updated.name, location: updated.location, hasOnboarded: updated.hasOnboarded });
  } catch (err) { next(err); }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    await deleteUser(user._id as Types.ObjectId);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function getPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const levelInfo = calculateUserLevel(user.points);
    res.json({
      balance: user.points,
      streakDays: user.streakDays,
      level: levelInfo,
    });
  } catch (err) { next(err); }
}

export async function getPointsHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      PointsLedger.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PointsLedger.countDocuments({ userId: user._id }),
    ]);
    res.json({ entries, total, page, limit });
  } catch (err) { next(err); }
}

export async function getMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const uid = user._id as Types.ObjectId;
    const [todaySlugs, everSlugs] = await Promise.all([
      getCompletedTodaySlugs(uid),
      getCompletedEverSlugs(uid),
    ]);
    res.json({ completedToday: todaySlugs, completedEver: everSlugs });
  } catch (err) { next(err); }
}

export async function getMyBadges(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const uid = user._id as Types.ObjectId;
    const [totalCompleted, totalLessons] = await Promise.all([
      TaskCompletion.countDocuments({ userId: uid }),
      QuizAttempt.countDocuments({ userId: uid, isFirstPass: true }),
    ]);
    const progress = await getUserBadgeProgress(uid, {
      totalTasksCompleted: totalCompleted,
      totalLessonsCompleted: totalLessons,
    });
    const unlocked = await UserBadge.find({ userId: uid }).sort({ unlockedAt: -1 });
    res.json({ unlocked, progress });
  } catch (err) { next(err); }
}

export async function getMyVouchers(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const vouchers = await RewardRedemption.find({ userId: user._id }).sort({ claimedAt: -1 });
    res.json(vouchers);
  } catch (err) { next(err); }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      PointsLedger.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PointsLedger.countDocuments({ userId: user._id }),
    ]);
    // Map to ActivityLog shape the frontend expects
    const logs = entries.map((e) => ({
      id: e._id,
      type: e.eventType,
      title: e.description,
      pointsDelta: e.pointsDelta,
      timestamp: e.createdAt,
      impactDetails: e.impactDetails,
    }));
    res.json({ logs, total, page, limit });
  } catch (err) { next(err); }
}

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const settings = await UserSettings.findOne({ userId: user._id });
    res.json({
      notificationEnabled: settings?.notificationEnabled ?? user.notificationEnabled,
      dailyGoalPoints: settings?.dailyGoalPoints ?? user.dailyGoalPoints,
    });
  } catch (err) { next(err); }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const parsed = UpdateSettingsSchema.parse(req.body);
    const settings = await UserSettings.findOneAndUpdate(
      { userId: user._id },
      parsed,
      { new: true, upsert: true, runValidators: true }
    );
    // Sync to user doc for fast reads
    await User.findByIdAndUpdate(user._id, parsed);
    res.json({
      notificationEnabled: settings.notificationEnabled,
      dailyGoalPoints: settings.dailyGoalPoints,
    });
  } catch (err) { next(err); }
}
