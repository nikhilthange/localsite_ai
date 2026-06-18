import { ContactRepository } from '../repositories/ContactRepository';
import { Website } from '../../website/models/Website';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { QueueService, QueueNames } from '../../../core/queue/QueueService';
import { AppError } from '../../../utils/AppError';
import type { PaginationParams } from '../../../types/services';

export class ContactService {
  private repository: ContactRepository;

  constructor() {
    this.repository = new ContactRepository();
  }

  async submitForm(data: { websiteId: string; name: string; email: string; phone?: string; message: string; source?: string }) {
    const website = await Website.findById(data.websiteId).lean();
    if (!website) throw new AppError('Website not found', 404);

    const contact = await this.repository.create({
      websiteId: data.websiteId as any,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      source: data.source || 'website',
    });

    EventBus.emit(SystemEvents.LEAD_CAPTURED, {
      leadId: contact._id.toString(),
      websiteId: data.websiteId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: data.source || 'website',
      timestamp: new Date(),
    });

    await QueueService.addJob(QueueNames.NOTIFICATION, 'contact-form-submitted', {
      contactId: contact._id.toString(),
      websiteId: data.websiteId,
      userId: website.userId.toString(),
    });

    return contact;
  }

  async getContactsByWebsite(websiteId: string, userId: string, params: PaginationParams) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);
    return this.repository.findByWebsite(websiteId, params);
  }

  async getContactById(id: string, userId: string) {
    const contact = await this.repository.findById(id);
    if (!contact) throw new AppError('Contact not found', 404);
    const website = await Website.findOne({ _id: contact.websiteId, userId }).lean();
    if (!website) throw new AppError('Unauthorized', 403);
    return contact;
  }
}
