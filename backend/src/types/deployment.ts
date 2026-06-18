import { Document, Types } from 'mongoose';

export type DeploymentStatus = 'pending' | 'queued' | 'building' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';
export type DeploymentProvider = 'cloudflare' | 'aws_s3' | 'netlify' | 'vercel';

export interface IDeployment extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  status: DeploymentStatus;
  provider: DeploymentProvider;
  version: number;
  buildId?: string;
  url?: string;
  previewUrl?: string;
  customDomain?: string;
  domainVerified: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  sslIssuer?: string;
  sslExpiresAt?: Date;
  cdnEnabled: boolean;
  cdnProvider?: string;
  buildLogs: Array<{ timestamp: Date; level: 'info' | 'warn' | 'error'; message: string }>;
  assets: {
    totalSize: number;
    fileCount: number;
    pages: number;
  };
  previousDeploymentId?: Types.ObjectId;
  rollbackDeploymentId?: Types.ObjectId;
  error?: string;
  errorStack?: string;
  deployedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
