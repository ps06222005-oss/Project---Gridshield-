import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { getUserByFirebaseUid, findOrCreateUser } from '../services/userService';
import { calculateUserLevel } from '../services/pointsService';
import { getCompletedTodaySlugs } from '../services/taskService';
import { getCompletedLessonSlugs } from '../services/lessonService';
import { getUserBadgeProgress } from '../services/badgeService';
import { PointsLedger } from '../models/PointsLedger';
import { TaskCompletion } from '../models/TaskCompletion';
import { QuizAttempt } from '../models/QuizAttempt';
import { Task } from '../models/Task';
import { utcDateString, getUserLocalDateString } from '../services/taskService';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.user!.uid;
    let user = await getUserByFirebaseUid(uid);
    if (!user) {
      user = await findOrCreateUser({ firebaseUid: uid, name: req.user!.name ?? 'Green Guardian' });
    }
    const userId = user._id as Types.ObjectId;

    const [
      levelInfo,
      todaySlugs,
      completedSlugs,
      totalCompleted,
      totalLessons,
      recentActivity,
      todayPoints,
    ] = await Promise.all([
      Promise.resolve(calculateUserLevel(user.points)),
      getCompletedTodaySlugs(userId),
      getCompletedLessonSlugs(userId),
      TaskCompletion.countDocuments({ userId }),
      QuizAttempt.countDocuments({ userId, isFirstPass: true }),
      PointsLedger.find({ userId }).sort({ createdAt: -1 }).limit(5),
      TaskCompletion.aggregate([
        { $match: { userId, completedDate: getUserLocalDateString(new Date(), user.timezone || 'Asia/Kolkata') } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } },
      ]),
    ]);

    const badgeProgress = await getUserBadgeProgress(userId, {
      totalTasksCompleted: totalCompleted,
      totalLessonsCompleted: totalLessons,
    });
    const unlockedBadges = badgeProgress.filter((b) => b.isUnlocked);

    res.json({
      user: {
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
      },
      level: levelInfo,
      completedTasksToday: todaySlugs,
      completedTasksTotal: totalCompleted,
      completedLessonSlugs: completedSlugs,
      unlockedBadges,
      todayPoints: todayPoints[0]?.total ?? 0,
      recentActivity: recentActivity.map((e) => ({
        id: e._id,
        type: e.eventType,
        title: e.description,
        pointsDelta: e.pointsDelta,
        timestamp: e.createdAt,
        impactDetails: e.impactDetails,
      })),
    });
  } catch (err) { next(err); }
}
