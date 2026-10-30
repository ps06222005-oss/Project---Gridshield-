import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import * as ctrl from '../controllers/rewardsController';

const router = Router();

router.get('/', ctrl.listRewards);
router.post('/:rewardId/redeem', requireAuth, authLimiter, ctrl.redeemReward);

export default router;
