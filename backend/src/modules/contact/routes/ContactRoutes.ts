import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { submit, getByWebsite, getById } from '../controllers/ContactController';

const router = Router();

router.post('/', submit as any);

router.get('/websites/:websiteId', authMiddleware, getByWebsite as any);
router.get('/:id', authMiddleware, getById as any);

export default router;
