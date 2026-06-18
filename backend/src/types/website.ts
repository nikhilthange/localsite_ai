import { Document, Types } from 'mongoose';

export type WebsiteStatus = 'draft' | 'published' | 'archived';

export interface IWebsite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  businessName: string;
  category: string;
  subCategory?: string;
  location: string;
  phone: string;
  email: string;
  domain?: string;
  subdomain: string;
  status: WebsiteStatus;
  template: string;
  content: {
    headline: string;
    subheadline: string;
    about: string;
    services: Array<{ title: string; description: string; icon?: string; price?: string }>;
    gallery: string[];
    testimonials: Array<{ name: string; role: string; content: string; rating?: number; avatar?: string }>;
    faq: Array<{ question: string; answer: string }>;
    hours?: {
      monday?: { open: string; close: string };
      tuesday?: { open: string; close: string };
      wednesday?: { open: string; close: string };
      thursday?: { open: string; close: string };
      friday?: { open: string; close: string };
      saturday?: { open: string; close: string };
      sunday?: { open: string; close: string };
      notes?: string;
    };
    seo: {
      metaTitle: string;
      metaDescription: string;
      ogImage?: string;
      ogTitle?: string;
      ogDescription?: string;
      canonicalUrl?: string;
      structuredData?: Record<string, any>;
      keywords: string[];
      sitemapIncluded: boolean;
    };
  };
  branding: {
    logo?: string;
    logoVariations: string[];
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
    fontHeading?: string;
    borderRadius: string;
  };
  analytics: {
    pageViews: number;
    uniqueVisitors: number;
    leads: number;
    avgSessionDuration: number;
  };
  deploymentId?: Types.ObjectId;
  chatbotId?: Types.ObjectId;
  publishedAt?: Date;
  lastGeneratedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface ITemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory?: string;
  industries: string[];
  thumbnail: string;
  previewUrl: string;
  screenshots: string[];
  demoUrl?: string;
  isPremium: boolean;
  price?: number;
  discountPrice?: number;
  features: string[];
  sections: string[];
  colorSchemes: Array<{ name: string; primary: string; secondary: string; accent: string }>;
  fonts: string[];
  structure: Record<string, any>;
  popularity: number;
  usageCount: number;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
