import { Router } from 'express';
import * as ctrl from '../controllers/badgesController';

const router = Router();

router.get('/', ctrl.listBadges);

export default router;
