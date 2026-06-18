import { Document, Types } from 'mongoose';

export type AuditAction = 'create' | 'update' | 'delete' | 'soft_delete' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'view' | 'payment' | 'deployment' | 'config_change';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description?: string;
  changes?: Array<{ field: string; from?: any; to?: any }>;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
}
