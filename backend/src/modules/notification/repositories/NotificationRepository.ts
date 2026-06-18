import { BaseRepository } from '../../../core/database/BaseRepository';
import { Notification } from '../models/Notification';
import type { INotification } from '../../../types/models';
import { Types } from 'mongoose';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId: string | Types.ObjectId) {
    return this.find({ userId });
  }

  async getUnreadCount(userId: string | Types.ObjectId): Promise<number> {
    return this.count({ userId, read: false });
  }

  async markAllRead(userId: string | Types.ObjectId) {
    return this.bulkUpdate(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  async markAsRead(notificationId: string | Types.ObjectId) {
    return this.update(notificationId, { read: true, readAt: new Date() });
  }
}
