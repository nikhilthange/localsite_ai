import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { submit, getByWebsite, getById } from '../controllers/ContactController';
import { validateContactSubmit } from '../validators/ContactValidators';
import { RateLimiter } from '../../../core/security/RateLimiter';

const router = Router();

router.post('/', RateLimiter.api, ...validateContactSubmit, submit as any);

router.get('/websites/:websiteId', authMiddleware, getByWebsite as any);
router.get('/:id', authMiddleware, getById as any);

export default router;
