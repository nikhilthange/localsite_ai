import mongoose, { Schema } from 'mongoose';
import type { ICustomer } from '../../../types/models';

const customerSchema = new Schema<ICustomer>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    company: { type: String },
    tags: [{ type: String }],
    notes: [{ type: String }],
    lifetimeValue: { type: Number, default: 0 },
    lastContact: { type: Date },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
