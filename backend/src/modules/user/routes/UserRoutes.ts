import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, adminMiddleware } from '../../../core/security/AuthMiddleware';
import { validateUpdateProfile, validateUpdatePassword, validateUpdatePreferences } from '../validators/UserValidators';

const router = Router();

router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', ...validateUpdateProfile, UserController.updateProfile);
router.put('/password', ...validateUpdatePassword, UserController.updatePassword);
router.get('/preferences', UserController.getPreferences);
router.put('/preferences', ...validateUpdatePreferences, UserController.updatePreferences);

router.get('/', adminMiddleware, UserController.getAllUsers);
router.get('/analytics', adminMiddleware, UserController.getUserAnalytics);

export default router;
