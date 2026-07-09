import mongoose, { Schema } from 'mongoose';
import type { IWeeklyReport } from '../../../types/models';

const weeklyReportSchema = new Schema<IWeeklyReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    scores: {
      businessHealth: { type: Number, required: true, min: 0, max: 100 },
      seo: { type: Number, required: true, min: 0, max: 100 },
      leads: { type: Number, required: true, min: 0, max: 100 },
      conversion: { type: Number, required: true, min: 0, max: 100 },
      satisfaction: { type: Number, required: true, min: 0, max: 100 },
    },
    traffic: {
      totalVisitors: { type: Number, default: 0 },
      totalPageViews: { type: Number, default: 0 },
      avgSessionDuration: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
      topPages: [{ page: String, views: Number }],
      trafficSources: [{ source: String, count: Number }],
    },
    leads: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      contacted: { type: Number, default: 0 },
      converted: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      topSources: [{ source: String, count: Number }],
    },
    recommendations: [
      {
        category: { type: String },
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
        title: { type: String },
        description: { type: String },
        impact: { type: String },
        effort: { type: String },
        steps: [{ type: String }],
      },
    ],
    summary: { type: String },
    aiGenerated: { type: Boolean, default: false },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

weeklyReportSchema.index({ websiteId: 1, weekStart: -1 });
weeklyReportSchema.index({ userId: 1, createdAt: -1 });

export const WeeklyReport = mongoose.model<IWeeklyReport>('WeeklyReport', weeklyReportSchema);
