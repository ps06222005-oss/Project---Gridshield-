import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { LeaderboardQuerySchema } from '../schemas';
import * as ctrl from '../controllers/leaderboardController';

const router = Router();

router.get('/', requireAuth, validate(LeaderboardQuerySchema, 'query'), ctrl.getLeaderboard);

export default router;
