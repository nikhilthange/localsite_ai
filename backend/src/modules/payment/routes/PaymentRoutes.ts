import { Router, raw } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { validateCreateSubscription } from '../validators/PaymentValidators';
import { authMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

router.post('/webhook/:provider', raw({ type: 'application/json' }), PaymentController.webhook);
router.post('/subscribe', authMiddleware, ...validateCreateSubscription, PaymentController.createSubscription);
router.post('/cancel', authMiddleware, PaymentController.cancelSubscription);
router.get('/status', authMiddleware, PaymentController.getStatus);
router.get('/history', authMiddleware, PaymentController.getHistory);

export default router;
