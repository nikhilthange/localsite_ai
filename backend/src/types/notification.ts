import { Document, Types } from 'mongoose';

export type NotificationType = 'system' | 'growth' | 'lead' | 'deployment' | 'payment' | 'marketing' | 'mention' | 'subscription';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  icon?: string;
  read: boolean;
  readAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
