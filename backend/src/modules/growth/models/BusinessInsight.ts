import mongoose, { Schema } from 'mongoose';
import type { IBusinessInsight } from '../../../types/models';

const businessInsightSchema = new Schema<IBusinessInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    category: {
      type: String,
      enum: ['traffic', 'leads', 'conversions', 'seo', 'reviews', 'general'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metric: {
      name: { type: String },
      current: { type: Number },
      previous: { type: Number },
      change: { type: Number },
      unit: { type: String },
    },
    recommendation: { type: String },
    steps: [{ type: String }],
    read: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

businessInsightSchema.index({ userId: 1, read: 1, dismissed: 1 });
businessInsightSchema.index({ websiteId: 1, category: 1 });
businessInsightSchema.index({ createdAt: -1 });

export const BusinessInsight = mongoose.model<IBusinessInsight>('BusinessInsight', businessInsightSchema);
