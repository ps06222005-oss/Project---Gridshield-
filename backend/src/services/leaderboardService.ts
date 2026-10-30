/**
 * leaderboardService.ts — Real-user leaderboard from the database.
 * Never returns demo/fake accounts in the production leaderboard.
 */
import { User } from '../models/User';
import { UserBadge } from '../models/UserBadge';
import { Types } from 'mongoose';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  location: string;
  points: number;
  badgesCount: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  total: number;
  page: number;
  limit: number;
}

export async function getLeaderboard(opts: {
  currentUserId: Types.ObjectId;
  period: 'all-time' | 'weekly';
  page: number;
  limit: number;
}): Promise<LeaderboardResult> {
  const { currentUserId, page, limit } = opts;
  const skip = (page - 1) * limit;

  // For now both periods use all-time points.
  // Weekly leaderboard can be implemented with a weekly points snapshot collection later.
  const [users, total] = await Promise.all([
    User.find({ isDemo: false })
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit)
      .select('name location points'),
    User.countDocuments({ isDemo: false }),
  ]);

  // Get badge counts for returned users
  const userIds = users.map((u) => u._id as Types.ObjectId);
  const badgeCounts = await UserBadge.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  const badgeCountMap = new Map(
    badgeCounts.map((b: { _id: Types.ObjectId; count: number }) => [
      b._id.toString(),
      b.count,
    ])
  );

  const entries: LeaderboardEntry[] = users.map((user, index) => ({
    rank: skip + index + 1,
    userId: (user._id as Types.ObjectId).toString(),
    name: user.name,
    location: user.location,
    points: user.points,
    badgesCount: badgeCountMap.get((user._id as Types.ObjectId).toString()) ?? 0,
    isCurrentUser: (user._id as Types.ObjectId).toString() === currentUserId.toString(),
  }));

  // Find current user's rank if not on this page
  let currentUserRank: number | null = null;
  const userOnPage = entries.find((e) => e.isCurrentUser);
  if (userOnPage) {
    currentUserRank = userOnPage.rank;
  } else {
    const higherRanked = await User.countDocuments({
      isDemo: false,
      points: {
        $gt: (await User.findById(currentUserId).select('points'))?.points ?? 0,
      },
    });
    currentUserRank = higherRanked + 1;
  }

  return { entries, currentUserRank, total, page, limit };
}
