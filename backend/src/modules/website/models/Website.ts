import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IWebsite } from '../../../types/website';

const websiteSchema = new Schema<IWebsite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    subCategory: { type: String },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    description: { type: String, maxlength: 2000 },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    domain: { type: String, lowercase: true },
    subdomain: {
      type: String,
      required: [true, 'Subdomain is required'],
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    template: { type: String, required: [true, 'Template is required'] },
    sections: [{
      id: { type: String, required: true },
      type: { type: String, required: true },
      variant: { type: String, default: 'default' },
      visible: { type: Boolean, default: true },
      order: { type: Number, required: true },
      data: { type: Schema.Types.Mixed, default: {} },
      background: {
        type: { type: String, enum: ['color', 'gradient', 'image', 'video', 'none'] },
        value: String,
        overlay: String,
        parallax: Boolean,
      },
      padding: { type: String },
      animation: { type: String },
    }],
    branding: {
      logo: { type: String },
      logoPrompt: { type: String },
      favicon: { type: String },
      colors: {
        primary: { type: String, default: '#6366F1' },
        primaryLight: { type: String, default: '#818CF8' },
        primaryDark: { type: String, default: '#4F46E5' },
        secondary: { type: String, default: '#14B8A6' },
        secondaryLight: { type: String, default: '#2DD4BF' },
        accent: { type: String, default: '#F59E0B' },
        accentLight: { type: String, default: '#FBBF24' },
        background: { type: String, default: '#FAFAFA' },
        surface: { type: String, default: '#FFFFFF' },
        surfaceAlt: { type: String, default: '#F4F4F5' },
        text: { type: String, default: '#18181B' },
        textSecondary: { type: String, default: '#71717A' },
        textInverse: { type: String, default: '#FFFFFF' },
        border: { type: String, default: '#E4E4E7' },
        success: { type: String, default: '#22C55E' },
        warning: { type: String, default: '#F59E0B' },
        error: { type: String, default: '#EF4444' },
        darkMode: {
          background: { type: String, default: '#09090B' },
          surface: { type: String, default: '#18181B' },
          surfaceAlt: { type: String, default: '#27272A' },
          text: { type: String, default: '#FAFAFA' },
          textSecondary: { type: String, default: '#A1A1AA' },
          border: { type: String, default: '#27272A' },
        },
        gradients: {
          primary: { type: String, default: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
          secondary: { type: String, default: 'linear-gradient(135deg, #14B8A6, #06B6D4)' },
          accent: { type: String, default: 'linear-gradient(135deg, #F59E0B, #F97316)' },
        },
      },
      fonts: {
        heading: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' },
        headingWeight: { type: Number, default: 700 },
        bodyWeight: { type: Number, default: 400 },
      },
      spacing: {
        sectionPadding: { type: String, default: 'py-16 md:py-24' },
        sectionMargin: { type: String, default: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' },
        elementGap: { type: String, default: 'gap-6 md:gap-8' },
        containerWidth: { type: String, default: 'max-w-7xl' },
      },
      shadows: {
        small: { type: String, default: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
        medium: { type: String, default: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
        large: { type: String, default: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
        focus: { type: String, default: '0 0 0 2px #6366F1' },
      },
      animations: {
        section: { type: String, default: 'fade-up' },
        card: { type: String, default: 'stagger' },
        hover: { type: String, default: 'lift' },
        hero: { type: String, default: 'parallax' },
        duration: { type: Number, default: 0.6 },
      },
      logoStyle: { type: String, default: 'wordmark' },
      brandVoice: { type: String, default: 'professional' },
      tagline: { type: String, default: '' },
      mission: { type: String, default: '' },
    },
    seo: {
      metaTitle: { type: String, default: '', maxlength: 70 },
      metaDescription: { type: String, default: '', maxlength: 160 },
      ogImage: { type: String },
      ogTitle: { type: String },
      ogDescription: { type: String },
      canonicalUrl: { type: String },
      structuredData: { type: Schema.Types.Mixed },
      keywords: [{ type: String }],
      sitemapIncluded: { type: Boolean, default: true },
      robotsTxt: { type: String },
      twitterCard: { type: String },
      twitterSite: { type: String },
    },
    analytics: {
      pageViews: { type: Number, default: 0, min: 0 },
      uniqueVisitors: { type: Number, default: 0, min: 0 },
      leads: { type: Number, default: 0, min: 0 },
      avgSessionDuration: { type: Number, default: 0, min: 0 },
    },
    deploymentId: { type: Schema.Types.ObjectId, ref: 'Deployment' },
    chatbotId: { type: Schema.Types.ObjectId, ref: 'Chatbot' },
    publishedAt: { type: Date },
    lastGeneratedAt: { type: Date },
    version: { type: Number, default: 1, min: 1 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

websiteSchema.index({ userId: 1, status: 1 });
websiteSchema.index({ organizationId: 1, status: 1 });
websiteSchema.index({ domain: 1 }, { sparse: true });
websiteSchema.index({ status: 1, publishedAt: -1 });
websiteSchema.index({ category: 1, status: 1 });
websiteSchema.index({ userId: 1, updatedAt: -1 });
websiteSchema.index({ businessName: 'text', 'seo.metaDescription': 'text' });

websiteSchema.pre<IWebsite>('validate', function (next) {
  if (this.status === 'published') {
    if (!this.phone) {
      this.invalidate('phone', 'Phone number is required before publishing');
    }
    if (!this.email) {
      this.invalidate('email', 'Email is required before publishing');
    }
    if (!this.businessName) {
      this.invalidate('businessName', 'Business name is required before publishing');
    }
  }
  next();
});

websiteSchema.pre<IWebsite>('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

websiteSchema.virtual('previewUrl').get(function () {
  return `https://${this.subdomain}.localsiteai.com`;
});

websiteSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});

softDeletePlugin(websiteSchema);
auditPlugin(websiteSchema);

export const Website = mongoose.model<IWebsite>('Website', websiteSchema);
