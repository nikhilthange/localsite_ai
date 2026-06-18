import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, adminMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.updatePassword);
router.get('/preferences', UserController.getPreferences);
router.put('/preferences', UserController.updatePreferences);

router.get('/', adminMiddleware, UserController.getAllUsers);
router.get('/analytics', adminMiddleware, UserController.getUserAnalytics);

export default router;
