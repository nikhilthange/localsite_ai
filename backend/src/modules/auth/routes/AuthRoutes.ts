import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { registerValidator, loginValidator, forgotValidator, resetValidator } from '../validators/AuthValidators';
import { RateLimiter } from '../../../core/security/RateLimiter';
import { authMiddleware } from '../../../core/security/AuthMiddleware';

const router = Router();

router.post('/register', registerValidator, RateLimiter.auth, AuthController.register);
router.post('/login', loginValidator, RateLimiter.auth, AuthController.login);
router.post('/refresh-token', RateLimiter.auth, AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/forgot-password', forgotValidator, RateLimiter.auth, AuthController.forgotPassword);
router.post('/reset-password/:token', resetValidator, AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmail);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
