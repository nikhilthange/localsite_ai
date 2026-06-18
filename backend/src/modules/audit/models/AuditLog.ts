import mongoose, { Schema, Model } from 'mongoose';
import type { IAuditLog } from '../../../types/audit';

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
