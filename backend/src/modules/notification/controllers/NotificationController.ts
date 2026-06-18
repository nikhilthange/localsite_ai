import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { NotificationService } from '../services/NotificationService';

const notificationService = new NotificationService();

export const getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order } = req.query;
    const result = await notificationService.getNotifications(req.user!.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    res.json({ success: true, data: { modifiedCount: result } });
  } catch (err) {
    next(err);
  }
};

export const unreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};
