import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IOrganization } from '../../../types/organization';

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    members: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
        invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      timezone: { type: String, default: 'UTC' },
      locale: { type: String, default: 'en-US' },
      aiModel: { type: String, default: 'meta/llama-3.3-70b-instruct' },
      maxWebsites: { type: Number, default: 5, min: 1, max: 1000 },
      maxTeamMembers: { type: Number, default: 1, min: 1, max: 500 },
      branding: {
        logo: { type: String },
        primaryColor: { type: String, default: '#3B82F6', match: /^#[0-9a-fA-F]{6}$/ },
        favicon: { type: String },
      },
      features: [{ type: String }],
    },
    billing: {
      stripeCustomerId: { type: String, sparse: true },
      razorpayCustomerId: { type: String, sparse: true },
      taxId: { type: String },
      billingEmail: {
        type: String,
        required: [true, 'Billing email is required'],
        lowercase: true,
        trim: true,
      },
      billingAddress: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      invoicePrefix: { type: String, default: 'INV' },
    },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    isActive: { type: Boolean, default: true },
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

organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ owner: 1, isActive: 1 });
organizationSchema.index({ 'members.user': 1 });
organizationSchema.index({ 'billing.stripeCustomerId': 1 }, { sparse: true });
organizationSchema.index({ 'billing.razorpayCustomerId': 1 }, { sparse: true });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ name: 'text', slug: 'text' });

organizationSchema.pre<IOrganization>('save', function (next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);
  }
  next();
});

organizationSchema.virtual('memberCount').get(function () {
  return this.members?.length || 0;
});

organizationSchema.virtual('activeSubscription').get(function () {
  return !!this.subscription;
});

softDeletePlugin(organizationSchema);
auditPlugin(organizationSchema);

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
