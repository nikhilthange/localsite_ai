import { NotificationRepository } from '../repositories/NotificationRepository';
import type { INotification } from '../../../types/models';
import type { PaginationParams } from '../../../types/services';
import { Types } from 'mongoose';
import { getIO } from '../../../core/socket/SocketSetup';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  async create(
    userId: string,
    type: INotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const notification = await this.repository.create({
      userId: new Types.ObjectId(userId) as any,
      type,
      title,
      message,
      data: data as any,
      read: false,
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification', notification);
    } catch {
      // socket not initialized
    }

    return notification;
  }

  async getNotifications(userId: string, params: PaginationParams) {
    return this.repository.paginate({ userId }, params);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.repository.findOne({ _id: notificationId, userId });
    if (!notification) throw new Error('Notification not found');
    return this.repository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.repository.markAllRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.getUnreadCount(userId);
  }
}
