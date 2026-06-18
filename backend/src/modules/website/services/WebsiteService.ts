import { Types } from 'mongoose';
import { WebsiteRepository } from '../repositories/WebsiteRepository';
import { IWebsite, WebsiteStatus } from '../../../types/models';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { QueueService, QueueNames } from '../../../core/queue/QueueService';
import { NotFoundError, ForbiddenError } from '../../../utils/AppError';
import { generateSubdomain } from '../../../utils/helpers';
import { PaginationParams, PaginatedResult } from '../../../types/services';

export class WebsiteService {
  private repository: WebsiteRepository;

  constructor() {
    this.repository = new WebsiteRepository();
  }

  async createWebsite(userId: string, data: {
    businessName: string;
    category: string;
    location: string;
    phone: string;
    email: string;
    template?: string;
  }): Promise<IWebsite> {
    const subdomain = generateSubdomain(data.businessName);
    const template = data.template || 'default';

    const website = await this.repository.create({
      userId: new Types.ObjectId(userId),
      businessName: data.businessName,
      category: data.category,
      location: data.location,
      phone: data.phone,
      email: data.email,
      subdomain,
      template,
      status: 'draft',
    } as any);

    EventBus.emit(SystemEvents.WEBSITE_CREATED, {
      websiteId: website._id.toString(),
      userId,
      businessName: data.businessName,
      timestamp: new Date(),
    });

    return website;
  }

  async getWebsites(
    userId: string,
    params: PaginationParams & { status?: string; search?: string }
  ): Promise<PaginatedResult<IWebsite>> {
    return this.repository.getWebsitesByUserPaginated(userId, params);
  }

  async getWebsiteById(websiteId: string, userId: string): Promise<IWebsite> {
    const website = await this.repository.getWebsiteWithDetails(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    return website;
  }

  async updateWebsite(websiteId: string, userId: string, data: Partial<IWebsite>): Promise<IWebsite> {
    const website = await this.repository.findById(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    const updated = await this.repository.update(websiteId, data as any);
    if (!updated) {
      throw new NotFoundError('Website');
    }
    return updated;
  }

  async deleteWebsite(websiteId: string, userId: string): Promise<void> {
    const website = await this.repository.findById(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    await this.repository.update(websiteId, { status: 'archived' } as any);

    EventBus.emit(SystemEvents.WEBSITE_DELETED, {
      websiteId,
      userId,
      timestamp: new Date(),
    });
  }

  async generateWebsiteContent(websiteId: string, userId: string): Promise<void> {
    const website = await this.getWebsiteById(websiteId, userId);

    await QueueService.addJob(
      QueueNames.AI_GENERATION,
      'website-content-generation',
      {
        websiteId: website._id.toString(),
        userId,
        businessName: website.businessName,
        category: website.category,
        location: website.location,
        template: website.template,
      }
    );
  }

  async publishWebsite(websiteId: string, userId: string): Promise<IWebsite> {
    const website = await this.getWebsiteById(websiteId, userId);

    if (website.status === 'published') {
      return website;
    }

    const updated = await this.repository.update(websiteId, {
      status: 'published',
      publishedAt: new Date(),
    } as any);

    if (!updated) {
      throw new NotFoundError('Website');
    }

    EventBus.emit(SystemEvents.WEBSITE_DEPLOYED, {
      websiteId,
      userId,
      status: 'started',
      timestamp: new Date(),
    });

    return updated;
  }

  async searchWebsites(query: string): Promise<IWebsite[]> {
    return this.repository.searchByName(query);
  }
}
