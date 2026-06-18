import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { ILead } from '../../../types/models';
import { Lead } from '../models/Lead';

export class LeadRepository extends BaseRepository<ILead> {
  constructor() {
    super(Lead);
  }

  async findByWebsiteId(websiteId: string | Types.ObjectId, status?: string): Promise<ILead[]> {
    const filter: Record<string, any> = { websiteId };
    if (status) filter.status = status;
    return this.find(filter);
  }

  async findByEmail(websiteId: string | Types.ObjectId, email: string): Promise<ILead | null> {
    return this.findOne({ websiteId, email: email.toLowerCase() } as any);
  }

  async assignLead(leadId: string | Types.ObjectId, assignedTo: string | Types.ObjectId): Promise<ILead | null> {
    return this.update(leadId, { assignedTo } as any);
  }

  async updateStatus(leadId: string | Types.ObjectId, status: ILead['status']): Promise<ILead | null> {
    const update: Record<string, any> = { status };
    if (status === 'converted') update.convertedAt = new Date();
    return this.update(leadId, update as any);
  }

  async getLeadsByUserWebsite(websiteId: string | Types.ObjectId, params: any) {
    return this.paginate({ websiteId }, params);
  }
}
