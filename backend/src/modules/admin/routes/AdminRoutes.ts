import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../../core/security/AuthMiddleware';
import {
  dashboard,
  users,
  userDetails,
  updateRole,
  toggleStatus,
  websites,
  payments,
  systemLogs,
  analytics,
} from '../controllers/AdminController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', dashboard as any);
router.get('/users', users as any);
router.get('/users/:id', userDetails as any);
router.put('/users/:id/role', updateRole as any);
router.put('/users/:id/toggle-status', toggleStatus as any);
router.get('/websites', websites as any);
router.get('/payments', payments as any);
router.get('/logs', systemLogs as any);
router.get('/analytics', analytics as any);

export default router;
