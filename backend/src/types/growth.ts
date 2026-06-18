import { Document, Types } from 'mongoose';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type InsightCategory = 'traffic' | 'leads' | 'conversions' | 'seo' | 'reviews' | 'general';

export interface IWeeklyReport extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  scores: {
    businessHealth: number;
    seo: number;
    leads: number;
    conversion: number;
    satisfaction: number;
  };
  traffic: {
    totalVisitors: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
    trafficSources: Array<{ source: string; count: number }>;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    conversionRate: number;
    topSources: Array<{ source: string; count: number }>;
  };
  recommendations: Array<{
    category: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: string;
    steps: string[];
  }>;
  summary: string;
  aiGenerated: boolean;
  emailed: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
}

export interface IBusinessInsight extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  category: InsightCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  metric?: {
    name: string;
    current: number;
    previous: number;
    change: number;
    unit: string;
  };
  recommendation?: string;
  steps?: string[];
  read: boolean;
  dismissed: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
