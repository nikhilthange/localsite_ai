import { Document, Types } from 'mongoose';

export type AnalyticsEventType = 'pageview' | 'click' | 'form_submit' | 'lead' | 'chat' | 'scroll';

export interface IAnalytics extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  visitorId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  page: string;
  referrer?: string;
  referrerDomain?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  device: string;
  browser: string;
  browserVersion?: string;
  os: string;
  screenResolution?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
  userAgent?: string;
  duration: number;
  bounce: boolean;
  timestamp: Date;
}
