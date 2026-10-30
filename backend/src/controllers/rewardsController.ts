import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Reward } from '../models/Reward';
import { redeemReward as redeemRewardSvc } from '../services/rewardService';
import { getUserByFirebaseUid, findOrCreateUser } from '../services/userService';

async function resolveUser(req: Request) {
  const uid = req.user!.uid;
  let user = await getUserByFirebaseUid(uid);
  if (!user) {
    user = await findOrCreateUser({ firebaseUid: uid, name: req.user!.name ?? 'Green Guardian' });
  }
  return user;
}

export async function listRewards(_req: Request, res: Response, next: NextFunction) {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ costPoints: 1 });
    res.json(rewards);
  } catch (err) { next(err); }
}

export async function redeemReward(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const rewardId = Array.isArray(req.params.rewardId) ? req.params.rewardId[0] : req.params.rewardId;
    const result = await redeemRewardSvc(user._id as Types.ObjectId, rewardId);
    res.status(200).json(result);
  } catch (err) { next(err); }
}
