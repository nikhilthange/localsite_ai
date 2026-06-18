import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { ISubscription } from '../../../types/payment';

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    plan: {
      type: String,
      required: [true, 'Plan is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trialing', 'past_due'],
      default: 'active',
      index: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: [true, 'Provider is required'],
    },
    providerSubscriptionId: {
      type: String,
      required: [true, 'Provider subscription ID is required'],
    },
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    trialStart: { type: Date },
    trialEnd: { type: Date },
    features: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    billingAnchor: { type: Number },
    daysUntilDue: { type: Number, default: 0, min: 0 },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    lastPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
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

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ organizationId: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ providerSubscriptionId: 1 }, { unique: true, sparse: true });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ createdAt: -1 });

softDeletePlugin(subscriptionSchema);
auditPlugin(subscriptionSchema);

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
