import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import {
  dashboard,
  websiteDashboard,
  generateReport,
  getReports,
  getReportDetail,
  getTrends,
  getInsights,
  markRead,
  dismissInsight,
} from '../controllers/GrowthController';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', dashboard as any);
router.get('/websites/:websiteId/dashboard', websiteDashboard as any);
router.post('/websites/:websiteId/generate', generateReport as any);
router.get('/websites/:websiteId/reports', getReports as any);
router.get('/reports/:reportId', getReportDetail as any);
router.get('/websites/:websiteId/trends', getTrends as any);
router.get('/insights', getInsights as any);
router.put('/insights/:insightId/read', markRead as any);
router.put('/insights/:insightId/dismiss', dismissInsight as any);

export default router;
