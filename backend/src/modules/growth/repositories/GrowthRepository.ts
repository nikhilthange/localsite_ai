import { BaseRepository } from '../../../core/database/BaseRepository';
import { WeeklyReport } from '../models/WeeklyReport';
import { BusinessInsight } from '../models/BusinessInsight';
import type { IWeeklyReport, IBusinessInsight } from '../../../types/models';
import type { PaginationParams } from '../../../types/services';
import { Types } from 'mongoose';

export class GrowthRepository {
  private reportRepo: BaseRepository<IWeeklyReport>;
  private insightRepo: BaseRepository<IBusinessInsight>;

  constructor() {
    this.reportRepo = new (class extends BaseRepository<IWeeklyReport> {
      constructor() { super(WeeklyReport); }
    })();
    this.insightRepo = new (class extends BaseRepository<IBusinessInsight> {
      constructor() { super(BusinessInsight); }
    })();
  }

  async getLatestReport(websiteId: string | Types.ObjectId) {
    return WeeklyReport.findOne({ websiteId }).sort({ weekStart: -1 }).lean();
  }

  async getReportsByWebsite(websiteId: string | Types.ObjectId, params: PaginationParams) {
    return this.reportRepo.paginate({ websiteId }, params);
  }

  async getReportById(reportId: string | Types.ObjectId) {
    return this.reportRepo.findById(reportId);
  }

  async getWeeklyTrends(websiteId: string | Types.ObjectId, weeks: number = 8) {
    return WeeklyReport.find({ websiteId })
      .sort({ weekStart: -1 })
      .limit(weeks)
      .lean();
  }

  async createReport(data: Partial<IWeeklyReport>) {
    return this.reportRepo.create(data);
  }

  async markReportEmailed(reportId: string | Types.ObjectId) {
    return this.reportRepo.update(reportId, { emailed: true });
  }

  async getInsights(userId: string | Types.ObjectId, params: PaginationParams & { websiteId?: string; read?: boolean; dismissed?: boolean }) {
    const filter: Record<string, any> = { userId };
    if (params.websiteId) filter.websiteId = params.websiteId;
    if (params.read !== undefined) filter.read = params.read;
    if (params.dismissed !== undefined) filter.dismissed = params.dismissed;
    return this.insightRepo.paginate(filter, params);
  }

  async getUnreadInsightCount(userId: string | Types.ObjectId) {
    return BusinessInsight.countDocuments({ userId, read: false, dismissed: false });
  }

  async createInsight(data: Partial<IBusinessInsight>) {
    return this.insightRepo.create(data);
  }

  async markInsightRead(insightId: string | Types.ObjectId) {
    return this.insightRepo.update(insightId, { read: true, readAt: new Date() });
  }

  async markInsightDismissed(insightId: string | Types.ObjectId) {
    return this.insightRepo.update(insightId, { dismissed: true });
  }
}
