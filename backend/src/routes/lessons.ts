import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { QuizSubmitSchema } from '../schemas';
import * as ctrl from '../controllers/lessonsController';

const router = Router();

router.get('/', ctrl.listLessons);
router.get('/:lessonId', ctrl.getLesson);
router.get('/:lessonId/quiz', ctrl.getQuiz);

router.post(
  '/:lessonId/quiz/submit',
  requireAuth,
  authLimiter,
  validate(QuizSubmitSchema),
  ctrl.submitQuiz
);

export default router;
