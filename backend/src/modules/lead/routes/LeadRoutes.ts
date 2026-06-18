import { Router } from 'express';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { getLeads, getLeadById, updateStatus, assignLead } from '../controllers/LeadController';
import { validateUpdateStatus, validateAssign } from '../validators/LeadValidators';

const router = Router();

router.use(authMiddleware);

router.get('/websites/:websiteId', getLeads as any);
router.get('/:id', getLeadById as any);
router.put('/:id/status', ...validateUpdateStatus, updateStatus as any);
router.put('/:id/assign', ...validateAssign, assignLead as any);

export default router;
