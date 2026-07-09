import mongoose, { Schema } from 'mongoose';
import type { ICampaign } from '../../../types/models';

const campaignSchema = new Schema<ICampaign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['email', 'social', 'seasonal', 'festival', 'sms'],
      required: true,
    },
    platform: {
      type: String,
      enum: ['instagram', 'facebook', 'linkedin', 'twitter', 'email', 'sms', 'google'],
    },
    content: {
      headline: { type: String, required: true },
      body: { type: String, required: true },
      cta: { type: String, required: true },
      imageUrl: { type: String },
      videoUrl: { type: String },
      linkUrl: { type: String },
    },
    audience: {
      segments: [{ type: String }],
      tags: [{ type: String }],
      excludeTags: [{ type: String }],
      maxRecipients: { type: Number },
    },
    schedule: {
      timezone: { type: String, default: 'UTC' },
      scheduledFor: { type: Date },
      publishedAt: { type: Date },
      completedAt: { type: Date },
      sendRecurring: { type: Boolean, default: false },
      recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    },
    budget: {
      amount: { type: Number },
      currency: { type: String, default: 'USD' },
      dailyCap: { type: Number },
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed', 'completed', 'paused'],
      default: 'draft',
    },
    performance: {
      impressions: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      clickRate: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      roi: { type: Number, default: 0 },
    },
    error: { type: String },
  },
  { timestamps: true }
);

campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ websiteId: 1, status: 1 });
campaignSchema.index({ organizationId: 1, status: 1 });
campaignSchema.index({ type: 1, status: 1 });
campaignSchema.index({ 'schedule.scheduledFor': 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
