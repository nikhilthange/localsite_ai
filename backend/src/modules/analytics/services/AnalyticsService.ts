import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { Website } from '../../website/models/Website';
import { AppError } from '../../../utils/AppError';
import { Types } from 'mongoose';

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor() {
    this.repository = new AnalyticsRepository();
  }

  async trackPageView(data: {
    websiteId: string;
    visitorId: string;
    page: string;
    referrer?: string;
    device: string;
    browser: string;
    os: string;
    country?: string;
    city?: string;
    sessionId: string;
    duration?: number;
    bounce?: boolean;
  }) {
    return this.repository.trackEvent({
      websiteId: new Types.ObjectId(data.websiteId) as any,
      visitorId: data.visitorId,
      page: data.page,
      referrer: data.referrer,
      device: data.device,
      browser: data.browser,
      os: data.os,
      country: data.country,
      city: data.city,
      sessionId: data.sessionId,
      duration: data.duration || 0,
      bounce: data.bounce !== undefined ? data.bounce : true,
      timestamp: new Date(),
    });
  }

  async getWebsiteStats(websiteId: string, dateRange: { start: Date; end: Date }) {
    const website = await Website.findById(websiteId).lean();
    if (!website) throw new AppError('Website not found', 404);

    const [overview, byPage, sources, geo, devices, hourly] = await Promise.all([
      this.repository.getWebsiteAnalytics(websiteId, dateRange.start, dateRange.end),
      this.repository.getAnalyticsByPage(websiteId, dateRange.start, dateRange.end),
      this.repository.getTrafficSources(websiteId, dateRange.start, dateRange.end),
      this.repository.getGeoData(websiteId, dateRange.start, dateRange.end),
      this.repository.getDeviceStats(websiteId, dateRange.start, dateRange.end),
      this.repository.getHourlyTraffic(websiteId, dateRange.start, dateRange.end),
    ]);

    const overviewData = overview[0] || {};
    return {
      overview: {
        totalVisitors: overviewData.totalVisitors?.length || 0,
        totalPageViews: overviewData.totalPageViews || 0,
        avgSessionDuration: Math.round(overviewData.avgDuration || 0),
        bounceRate: overviewData.bounceRate ? Math.round(overviewData.bounceRate * 100) / 100 : 0,
        uniqueVisitors: overviewData.totalVisitors?.length || 0,
      },
      byPage,
      sources,
      geo,
      devices,
      hourly,
    };
  }

  async getDashboardData(websiteId: string, period: '7d' | '30d' | '90d' = '30d') {
    const endDate = new Date();
    const startDate = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    startDate.setDate(startDate.getDate() - (daysMap[period] || 30));

    return this.getWebsiteStats(websiteId, { start: startDate, end: endDate });
  }
}
