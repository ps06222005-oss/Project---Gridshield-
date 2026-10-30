import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { CompleteTaskSchema, TaskFilterQuerySchema } from '../schemas';
import * as ctrl from '../controllers/tasksController';

const router = Router();

router.get('/', validate(TaskFilterQuerySchema, 'query'), ctrl.listTasks);
router.get('/:taskId', ctrl.getTask);

// Task completion requires auth + rate limiting
router.post(
  '/:taskId/complete',
  requireAuth,
  authLimiter,
  validate(CompleteTaskSchema),
  ctrl.completeTask
);

export default router;
