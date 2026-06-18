import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { deploy, status, history, setupDomain, checkSsl } from '../controllers/DeploymentController';

const router = Router();

router.use(authMiddleware);

router.post('/websites/:websiteId/deploy', deploy as any);
router.get('/:deploymentId/status', status as any);
router.get('/websites/:websiteId/history', history as any);
router.post('/:deploymentId/domain', setupDomain as any);
router.get('/:deploymentId/ssl', checkSsl as any);

export default router;
