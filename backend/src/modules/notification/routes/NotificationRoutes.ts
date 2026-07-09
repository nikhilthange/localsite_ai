import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { getAll, markRead, markAllRead, unreadCount } from '../controllers/NotificationController';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll as any);
router.put('/read-all', markAllRead as any);
router.put('/:id/read', markRead as any);
router.get('/unread-count', unreadCount as any);

export default router;
