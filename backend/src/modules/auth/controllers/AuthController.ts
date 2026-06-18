import { Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../../../types/express';
import { config } from '../../../config';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);

      res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token required' });
        return;
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const userId = req.user?.userId;

      if (refreshToken && userId) {
        await AuthService.logout(userId, refreshToken);
      }

      res.clearCookie('refreshToken', { path: '/api/auth' });

      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
