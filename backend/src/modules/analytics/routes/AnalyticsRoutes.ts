import { Router } from 'express';
import { authMiddleware, optionalAuth } from '../../../core/security/AuthMiddleware';
import { track, websiteStats, dashboard } from '../controllers/AnalyticsController';

const router = Router();

router.post('/track', optionalAuth, track as any);

router.get('/websites/:websiteId', authMiddleware, websiteStats as any);
router.get('/websites/:websiteId/dashboard', authMiddleware, dashboard as any);

export default router;
