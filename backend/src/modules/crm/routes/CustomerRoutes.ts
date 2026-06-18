import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { getCustomers, getCustomerById } from '../controllers/CustomerController';

const router = Router();

router.use(authMiddleware);

router.get('/websites/:websiteId', getCustomers as any);
router.get('/:id', getCustomerById as any);

export default router;
