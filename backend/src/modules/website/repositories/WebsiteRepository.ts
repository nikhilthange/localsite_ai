import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { IWebsite } from '../../../types/models';
import { Website } from '../models/Website';
import { PaginationParams, PaginatedResult } from '../../../types/services';

export class WebsiteRepository extends BaseRepository<IWebsite> {
  constructor() {
    super(Website);
  }

  async findByUserId(userId: string | Types.ObjectId, status?: string): Promise<IWebsite[]> {
    const filter: Record<string, any> = { userId };
    if (status) {
      filter.status = status;
    }
    return this.find(filter);
  }

  async findBySubdomain(subdomain: string): Promise<IWebsite | null> {
    return this.findOne({ subdomain } as any);
  }

  async searchByName(query: string): Promise<IWebsite[]> {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.model.find({
      businessName: { $regex: escaped, $options: 'i' },
    }).lean() as unknown as Promise<IWebsite[]>;
  }

  async getWebsiteWithDetails(id: string | Types.ObjectId): Promise<IWebsite | null> {
    return this.model.findById(id)
      .populate('deploymentId')
      .populate('chatbotId')
      .lean() as unknown as Promise<IWebsite | null>;
  }

  async updateBranding(id: string | Types.ObjectId, branding: IWebsite['branding']): Promise<IWebsite | null> {
    return this.update(id, { branding } as any);
  }

  async updateAnalytics(id: string | Types.ObjectId, analytics: Partial<IWebsite['analytics']>): Promise<IWebsite | null> {
    return this.model.findByIdAndUpdate(
      id,
      { $set: { analytics } },
      { new: true, runValidators: true }
    ).lean() as unknown as Promise<IWebsite | null>;
  }

  async incrementPageViews(id: string | Types.ObjectId): Promise<IWebsite | null> {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { 'analytics.pageViews': 1 } },
      { new: true }
    ).lean() as unknown as Promise<IWebsite | null>;
  }

  async incrementLeads(id: string | Types.ObjectId): Promise<IWebsite | null> {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { 'analytics.leads': 1 } },
      { new: true }
    ).lean() as unknown as Promise<IWebsite | null>;
  }

  async getWebsitesByUserPaginated(
    userId: string | Types.ObjectId,
    params: PaginationParams & { status?: string; search?: string }
  ): Promise<PaginatedResult<IWebsite>> {
    const filter: Record<string, any> = { userId };

    if (params.status) {
      filter.status = params.status;
    }

    if (params.search) {
      const escaped = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { businessName: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } },
      ];
    }

    return this.paginate(filter, params);
  }
}
