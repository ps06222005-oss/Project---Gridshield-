import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { getLeaderboard as getLeaderboardSvc } from '../services/leaderboardService';
import { getUserByFirebaseUid, findOrCreateUser } from '../services/userService';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.user!.uid;
    let user = await getUserByFirebaseUid(uid);
    if (!user) {
      user = await findOrCreateUser({ firebaseUid: uid, name: req.user!.name ?? 'Green Guardian' });
    }
    const { period, page, limit } = req.query as unknown as {
      period: 'weekly' | 'all-time'; page: number; limit: number;
    };
    const result = await getLeaderboardSvc({
      currentUserId: user._id as Types.ObjectId,
      period: period ?? 'all-time',
      page: page ?? 1,
      limit: limit ?? 20,
    });
    res.json(result);
  } catch (err) { next(err); }
}
