import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/dashboardController';

const router = Router();

router.get('/', requireAuth, ctrl.getDashboard);

export default router;
