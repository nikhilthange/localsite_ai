import { Router } from 'express';
import { WebsiteController } from '../controllers/WebsiteController';
import { validateCreateWebsite, validateUpdateWebsite } from '../validators/WebsiteValidators';
import { authMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', ...validateCreateWebsite, WebsiteController.create);
router.get('/', WebsiteController.getAll);
router.get('/search', WebsiteController.search);
router.get('/:id', WebsiteController.getById);
router.put('/:id', ...validateUpdateWebsite, WebsiteController.update);
router.delete('/:id', WebsiteController.delete);
router.post('/:id/generate', WebsiteController.generate);
router.post('/:id/publish', WebsiteController.publish);

export default router;
