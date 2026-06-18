import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController';

const router = Router();

router.get('/', TemplateController.getAll);
router.get('/category/:category', TemplateController.getByCategory);
router.get('/slug/:slug', TemplateController.getBySlug);
router.get('/:id', TemplateController.getById);

export default router;
