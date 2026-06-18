import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { INotification } from '../../../types/notification';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: ['system', 'growth', 'lead', 'deployment', 'payment', 'marketing', 'mention', 'subscription'],
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'sms'],
      default: 'in_app',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    data: { type: Map, of: Schema.Types.Mixed },
    actionUrl: { type: String },
    icon: { type: String },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    dismissedAt: { type: Date },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

softDeletePlugin(notificationSchema);
auditPlugin(notificationSchema);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
