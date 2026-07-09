import mongoose, { Schema } from 'mongoose';
import type { ICustomer } from '../../../types/models';

const customerSchema = new Schema<ICustomer>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'] },
    phone: { type: String },
    company: { type: String },
    tags: [{ type: String }],
    notes: [{ type: String }],
    lifetimeValue: { type: Number, default: 0 },
    lastContact: { type: Date },
  },
  { timestamps: true }
);

customerSchema.index({ websiteId: 1, email: 1 }, { unique: true });
customerSchema.index({ userId: 1 });
customerSchema.index({ websiteId: 1, createdAt: -1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
