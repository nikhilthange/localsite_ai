import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IPayment } from '../../../types/payment';

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
      validate: {
        validator: (v: number) => Number.isFinite(v) && v >= 0,
        message: 'Amount must be a valid positive number',
      },
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'Invalid currency code'],
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: [true, 'Payment provider is required'],
    },
    providerPaymentId: {
      type: String,
      required: [true, 'Provider payment ID is required'],
    },
    providerOrderId: { type: String },
    providerInvoiceId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    plan: { type: String, required: [true, 'Plan is required'] },
    interval: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time'],
      required: [true, 'Billing interval is required'],
    },
    description: { type: String },
    receiptUrl: { type: String },
    invoiceUrl: { type: String },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundReason: { type: String },
    refundedAt: { type: Date },
    taxAmount: { type: Number, default: 0, min: 0 },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ organizationId: 1, createdAt: -1 });
paymentSchema.index({ providerPaymentId: 1 }, { unique: true });
paymentSchema.index({ providerOrderId: 1 }, { sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ subscriptionId: 1, createdAt: -1 });
paymentSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
paymentSchema.index({ paidAt: -1 });
paymentSchema.index({ plan: 1, status: 1 });

paymentSchema.pre<IPayment>('save', function (next) {
  if (this.isModified('status') && this.status === 'succeeded' && !this.paidAt) {
    this.paidAt = new Date();
  }
  if (this.isModified('status') && (this.status === 'refunded' || this.status === 'partially_refunded') && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

paymentSchema.virtual('netAmount').get(function () {
  return this.amount - this.taxAmount - this.refundAmount;
});

paymentSchema.virtual('isRefundable').get(function () {
  return this.status === 'succeeded' && this.refundAmount < this.amount;
});

softDeletePlugin(paymentSchema);
auditPlugin(paymentSchema);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
