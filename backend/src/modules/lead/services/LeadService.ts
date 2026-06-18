import { Types } from 'mongoose';
import { LeadRepository } from '../repositories/LeadRepository';
import type { ILead } from '../../../types/models';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { NotFoundError, ForbiddenError } from '../../../utils/AppError';

const repository = new LeadRepository();

export class LeadService {
  async getLeads(websiteId: string, userId: string, params: any) {
    return repository.getLeadsByUserWebsite(websiteId, params);
  }

  async getLeadById(leadId: string): Promise<ILead> {
    const lead = await repository.findById(leadId);
    if (!lead) throw new NotFoundError('Lead');
    return lead;
  }

  async updateLeadStatus(leadId: string, userId: string, status: ILead['status']) {
    const lead = await this.getLeadById(leadId);
    const updated = await repository.updateStatus(leadId, status);

    if (status === 'converted') {
      EventBus.emit(SystemEvents.LEAD_CONVERTED, {
        leadId,
        websiteId: lead.websiteId.toString(),
        timestamp: new Date(),
      });
    }

    return updated;
  }

  async assignLead(leadId: string, userId: string, assignedTo: string) {
    await this.getLeadById(leadId);
    return repository.assignLead(leadId, assignedTo);
  }
}
