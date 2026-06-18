import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/websites/:websiteId', (_req, res) => {
  res.json({ success: true, message: 'Chatbot endpoint' });
});

export default router;
