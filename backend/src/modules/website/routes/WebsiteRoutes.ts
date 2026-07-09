import { Router, Request, Response, NextFunction } from 'express';
import { WebsiteController } from '../controllers/WebsiteController';
import { validateCreateWebsite, validateUpdateWebsite, validateGenerateComplete, validateUpdateSection, validateReorderSections } from '../validators/WebsiteValidators';
import { authMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

const extendTimeout = (_req: Request, _res: Response, next: NextFunction) => {
  _req.socket.setTimeout(180000);
  _res.setTimeout(180000);
  next();
};

router.use(authMiddleware);

router.post('/', ...validateCreateWebsite, WebsiteController.create);
router.post('/generate-complete', extendTimeout, ...validateGenerateComplete, WebsiteController.generateComplete);
router.get('/', WebsiteController.getAll);
router.get('/search', WebsiteController.search);
router.get('/:id', WebsiteController.getById);
router.put('/:id', ...validateUpdateWebsite, WebsiteController.update);
router.delete('/:id', WebsiteController.delete);
router.post('/:id/generate', WebsiteController.generate);
router.post('/:id/publish', WebsiteController.publish);
router.patch('/:id/sections', ...validateUpdateSection, WebsiteController.updateSection);
router.put('/:id/reorder', ...validateReorderSections, WebsiteController.reorderSections);

export default router;
