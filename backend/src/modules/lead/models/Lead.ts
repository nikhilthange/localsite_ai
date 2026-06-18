import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { ILead } from '../../../types/crm';

const leadSchema = new Schema<ILead>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: [true, 'Website ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: { type: String, trim: true },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      index: true,
    },
    sourceUrl: { type: String },
    utm: {
      source: { type: String },
      medium: { type: String },
      campaign: { type: String },
      term: { type: String },
      content: { type: String },
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    tags: [{ type: String }],
    notes: [{
      _id: false,
      content: { type: String, required: true },
      addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      addedAt: { type: Date, default: Date.now },
    }],
    convertedAt: { type: Date },
    convertedToCustomerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    lastContactedAt: { type: Date },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
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

leadSchema.index({ websiteId: 1, status: 1 });
leadSchema.index({ websiteId: 1, createdAt: -1 });
leadSchema.index({ email: 1, websiteId: 1 }, { unique: true });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ source: 1, websiteId: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ tags: 1 });
leadSchema.index({ organizationId: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text', message: 'text' });

leadSchema.pre<ILead>('save', function (next) {
  if (this.isModified('status') && this.status === 'converted' && !this.convertedAt) {
    this.convertedAt = new Date();
  }
  next();
});

leadSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

leadSchema.virtual('isStale').get(function () {
  const age = Math.floor((Date.now() - (this.createdAt as Date).getTime()) / (1000 * 60 * 60 * 24));
  return this.status === 'new' && age > 7;
});

softDeletePlugin(leadSchema);
auditPlugin(leadSchema);

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
