import { Document, Types } from 'mongoose';

export type CampaignType = 'email' | 'social' | 'seasonal' | 'festival' | 'sms';
export type CampaignPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'email' | 'sms' | 'google';
export type CampaignStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'completed' | 'paused';

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  name: string;
  type: CampaignType;
  platform?: CampaignPlatform;
  content: {
    headline: string;
    body: string;
    cta: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
  };
  audience: {
    segments: string[];
    tags: string[];
    excludeTags: string[];
    maxRecipients?: number;
  };
  schedule: {
    timezone: string;
    scheduledFor?: Date;
    publishedAt?: Date;
    completedAt?: Date;
    sendRecurring: boolean;
    recurringInterval?: 'daily' | 'weekly' | 'monthly';
  };
  budget?: {
    amount: number;
    currency: string;
    dailyCap?: number;
  };
  status: CampaignStatus;
  performance: {
    impressions: number;
    reach: number;
    clicks: number;
    clickRate: number;
    conversions: number;
    conversionRate: number;
    spent: number;
    roi: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
