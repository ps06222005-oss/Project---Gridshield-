import { Request, Response, NextFunction } from 'express';
import { Badge } from '../models/Badge';

export async function listBadges(_req: Request, res: Response, next: NextFunction) {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ bonusPoints: 1 });
    res.json(badges);
  } catch (err) { next(err); }
}
