import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IDeployment } from '../../../types/deployment';

const deploymentSchema = new Schema<IDeployment>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: [true, 'Website ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    status: {
      type: String,
      enum: ['pending', 'queued', 'building', 'deploying', 'deployed', 'failed', 'rolled_back'],
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['cloudflare', 'aws_s3', 'netlify', 'vercel'],
      default: 'vercel',
    },
    version: {
      type: Number,
      required: [true, 'Version is required'],
      min: 1,
    },
    buildId: { type: String },
    url: { type: String },
    previewUrl: { type: String },
    customDomain: { type: String },
    domainVerified: { type: Boolean, default: false },
    sslStatus: {
      type: String,
      enum: ['pending', 'active', 'failed'],
      default: 'pending',
    },
    sslIssuer: { type: String },
    sslExpiresAt: { type: Date },
    cdnEnabled: { type: Boolean, default: false },
    cdnProvider: { type: String },
    buildLogs: [{
      _id: false,
      timestamp: { type: Date, default: Date.now },
      level: { type: String, enum: ['info', 'warn', 'error'], required: true },
      message: { type: String, required: true },
    }],
    assets: {
      totalSize: { type: Number, default: 0, min: 0 },
      fileCount: { type: Number, default: 0, min: 0 },
      pages: { type: Number, default: 0, min: 0 },
    },
    previousDeploymentId: { type: Schema.Types.ObjectId, ref: 'Deployment' },
    rollbackDeploymentId: { type: Schema.Types.ObjectId, ref: 'Deployment' },
    error: { type: String },
    errorStack: { type: String },
    deployedAt: { type: Date },
    completedAt: { type: Date },
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

deploymentSchema.index({ websiteId: 1, version: -1 });
deploymentSchema.index({ websiteId: 1, status: 1 });
deploymentSchema.index({ userId: 1, createdAt: -1 });
deploymentSchema.index({ organizationId: 1, status: 1 });
deploymentSchema.index({ status: 1, createdAt: -1 });

softDeletePlugin(deploymentSchema);
auditPlugin(deploymentSchema);

export const Deployment = mongoose.model<IDeployment>('Deployment', deploymentSchema);
