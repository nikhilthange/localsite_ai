import { BaseRepository } from '../../../core/database/BaseRepository';
import { AuditLog } from '../models/AuditLog';
import type { IAuditLog } from '../../../types/audit';
import type { PaginationParams } from '../../../types/services';
import { Types } from 'mongoose';

export class AuditRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findByUser(userId: string | Types.ObjectId, params: PaginationParams) {
    return this.paginate({ userId }, params);
  }

  async findByResource(resource: string, resourceId: string, params: PaginationParams) {
    return this.paginate({ resource, resourceId }, params);
  }

  async getSystemLogs(params: PaginationParams & { userId?: string; action?: string }) {
    const filter: Record<string, any> = {};
    if (params.userId) filter.userId = new Types.ObjectId(params.userId);
    if (params.action) filter.action = params.action;
    return this.paginate(filter, params);
  }

  async log(userId: string, action: string, resource: string, resourceId: string | undefined, details: Record<string, any>, ip: string, userAgent: string) {
    return this.create({
      userId: new Types.ObjectId(userId) as any,
      action: action as any,
      resource,
      resourceId,
      details,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }
}
