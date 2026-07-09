import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IAnalytics } from '../../../types/analytics';

const analyticsSchema = new Schema<IAnalytics>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: [true, 'Website ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    visitorId: {
      type: String,
      required: [true, 'Visitor ID is required'],
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['pageview', 'click', 'form_submit', 'lead', 'chat', 'scroll'],
    },
    page: {
      type: String,
      required: [true, 'Page is required'],
    },
    referrer: { type: String },
    referrerDomain: { type: String },
    utm: {
      source: { type: String },
      medium: { type: String },
      campaign: { type: String },
    },
    device: { type: String, required: [true, 'Device is required'] },
    browser: { type: String, required: [true, 'Browser is required'] },
    browserVersion: { type: String },
    os: { type: String, required: [true, 'OS is required'] },
    screenResolution: { type: String },
    country: { type: String },
    countryCode: { type: String },
    city: { type: String },
    region: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    ip: { type: String },
    userAgent: { type: String },
    duration: { type: Number, default: 0, min: 0 },
    bounce: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
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

analyticsSchema.index({ websiteId: 1, timestamp: -1 });
analyticsSchema.index({ websiteId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ visitorId: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ country: 1, websiteId: 1 });
analyticsSchema.index({ referrerDomain: 1, websiteId: 1 });
analyticsSchema.index({ device: 1, websiteId: 1 });
analyticsSchema.index({ browser: 1, websiteId: 1 });
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

softDeletePlugin(analyticsSchema);
auditPlugin(analyticsSchema);

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
