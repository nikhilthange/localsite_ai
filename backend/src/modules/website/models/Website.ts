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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
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
    content: {
      headline: { type: String, default: '', maxlength: 500 },
      subheadline: { type: String, default: '', maxlength: 500 },
      about: { type: String, default: '', maxlength: 10000 },
      services: [{
        _id: false,
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String },
        price: { type: String },
      }],
      gallery: [{ type: String }],
      testimonials: [{
        _id: false,
        name: { type: String, required: true },
        role: { type: String },
        content: { type: String, required: true, maxlength: 2000 },
        rating: { type: Number, min: 1, max: 5 },
        avatar: { type: String },
      }],
      faq: [{
        _id: false,
        question: { type: String, required: true },
        answer: { type: String, required: true },
      }],
      hours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
        notes: { type: String },
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
      },
    },
    branding: {
      logo: { type: String },
      logoVariations: [{ type: String }],
      favicon: { type: String },
      primaryColor: { type: String, default: '#3B82F6', match: /^#[0-9a-fA-F]{6}$/ },
      secondaryColor: { type: String, default: '#1E40AF', match: /^#[0-9a-fA-F]{6}$/ },
      accentColor: { type: String, default: '#F59E0B', match: /^#[0-9a-fA-F]{6}$/ },
      font: { type: String, default: 'Inter' },
      fontHeading: { type: String },
      borderRadius: { type: String, default: '0.5rem' },
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
websiteSchema.index({ businessName: 'text', 'content.seo.metaDescription': 'text' });

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
