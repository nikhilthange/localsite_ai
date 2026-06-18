import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { ITemplate } from '../../../types/website';

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    subCategory: { type: String },
    industries: [{ type: String }],
    thumbnail: { type: String, required: [true, 'Thumbnail URL is required'] },
    previewUrl: { type: String, required: [true, 'Preview URL is required'] },
    screenshots: [{ type: String }],
    demoUrl: { type: String },
    isPremium: { type: Boolean, default: false, index: true },
    price: { type: Number, min: 0 },
    discountPrice: { type: Number, min: 0 },
    features: [{ type: String }],
    sections: [{ type: String }],
    colorSchemes: [{
      _id: false,
      name: { type: String, required: true },
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      accent: { type: String, required: true },
    }],
    fonts: [{ type: String }],
    structure: { type: Schema.Types.Mixed, default: {} },
    popularity: { type: Number, default: 0, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true, index: true },
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

templateSchema.index({ slug: 1 }, { unique: true });
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ isPremium: 1, isActive: 1 });
templateSchema.index({ popularity: -1 });
templateSchema.index({ rating: -1 });
templateSchema.index({ industries: 1, isActive: 1 });
templateSchema.index({ name: 'text', description: 'text', 'features': 'text' });
templateSchema.index({ createdAt: -1 });

templateSchema.pre<ITemplate>('save', function (next) {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  next();
});

templateSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice ?? this.price ?? 0;
});

templateSchema.virtual('isFree').get(function () {
  return !this.isPremium;
});

softDeletePlugin(templateSchema);
auditPlugin(templateSchema);

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
