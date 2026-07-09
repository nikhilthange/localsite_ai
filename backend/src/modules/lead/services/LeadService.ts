import { Types } from 'mongoose';
import { LeadRepository } from '../repositories/LeadRepository';
import type { ILead } from '../../../types/models';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { NotFoundError, ForbiddenError } from '../../../utils/AppError';
import { Website } from '../../website/models/Website';

const repository = new LeadRepository();

async function verifyWebsiteOwnership(websiteId: string, userId: string): Promise<void> {
  const website = await Website.findOne({ _id: websiteId, userId }).lean();
  if (!website) throw new ForbiddenError('You do not have access to this lead');
}

export class LeadService {
  async getLeads(websiteId: string, userId: string, params: any) {
    return repository.getLeadsByUserWebsite(websiteId, params);
  }

  async getLeadById(leadId: string, userId: string): Promise<ILead> {
    const lead = await repository.findById(leadId);
    if (!lead) throw new NotFoundError('Lead');
    await verifyWebsiteOwnership(lead.websiteId.toString(), userId);
    return lead;
  }

  async updateLeadStatus(leadId: string, userId: string, status: ILead['status']) {
    const lead = await this.getLeadById(leadId, userId);
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
    await this.getLeadById(leadId, userId);
    return repository.assignLead(leadId, assignedTo);
  }
}
