import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { UpdateProfileSchema, PaginationQuerySchema } from '../schemas';
import * as ctrl from '../controllers/meController';

const router = Router();

// All /me routes require authentication
router.use(requireAuth);

router.get('/', ctrl.getMe);
router.patch('/', validate(UpdateProfileSchema), ctrl.updateMe);
router.delete('/', authLimiter, ctrl.deleteMe);

router.get('/points', ctrl.getPoints);
router.get('/points/history', validate(PaginationQuerySchema, 'query'), ctrl.getPointsHistory);

router.get('/tasks', ctrl.getMyTasks);
router.get('/badges', ctrl.getMyBadges);
router.get('/vouchers', ctrl.getMyVouchers);
router.get('/activity', validate(PaginationQuerySchema, 'query'), ctrl.getActivity);
router.get('/settings', ctrl.getSettings);
router.patch('/settings', validate(UpdateProfileSchema), ctrl.updateSettings);

export default router;
