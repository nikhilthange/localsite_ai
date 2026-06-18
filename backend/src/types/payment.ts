import { Document, Types } from 'mongoose';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired' | 'trialing' | 'past_due';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'razorpay';
  providerPaymentId: string;
  providerOrderId?: string;
  providerInvoiceId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  plan: string;
  interval: 'monthly' | 'yearly' | 'one_time';
  description?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  refundAmount: number;
  refundReason?: string;
  refundedAt?: Date;
  taxAmount: number;
  metadata: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  plan: string;
  status: SubscriptionStatus;
  provider: 'stripe' | 'razorpay';
  providerSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  features: string[];
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  billingAnchor?: number;
  daysUntilDue: number;
  metadata: Record<string, any>;
  lastPaymentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
