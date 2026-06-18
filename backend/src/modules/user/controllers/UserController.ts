import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../../../types/express';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getProfile(req.user!.userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await UserService.updatePassword(req.user!.userId, currentPassword, newPassword);
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = await UserService.getPreferences(req.user!.userId);
      res.status(200).json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = await UserService.updatePreferences(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, sort, order } = req.query;
      const result = await UserService.getUsers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sort: sort as string,
        order: order as 'asc' | 'desc',
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await UserService.getUserAnalytics();
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}
