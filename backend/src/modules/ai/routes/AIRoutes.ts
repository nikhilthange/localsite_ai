import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authMiddleware } from '../../../core/security/AuthMiddleware';
import { RateLimiter } from '../../../core/security/RateLimiter';

const router = Router();

router.use(authMiddleware);

router.get('/tasks', AIController.getTaskCosts);
router.get('/templates', AIController.getBuiltInTemplates);
router.get('/credits/options', AIController.getCreditOptions);
router.get('/credits/check/:taskType', AIController.checkCredits);

router.post('/generate', RateLimiter.aiGeneration, AIController.generate);
router.post('/generate/stream', RateLimiter.aiGeneration, AIController.generateStream);
router.post('/generate/website', AIController.generateWebsiteContent);
router.post('/generate/seo', AIController.generateSeoMetadata);
router.post('/generate/blog', AIController.generateBlog);
router.post('/generate/faq', AIController.generateFaq);
router.post('/generate/marketing', AIController.generateMarketingCopy);

router.get('/usage', AIController.getUsage);
router.get('/usage/admin', AIController.getAdminUsage);

router.get('/credits', AIController.getCreditBalance);
router.get('/credits/history', AIController.getCreditHistory);
router.post('/credits/purchase', AIController.purchaseCredits);

router.put('/templates', AIController.savePromptTemplate);

export default router;
