import { BaseRepository } from '../../../core/database/BaseRepository';
import { Analytics } from '../models/Analytics';
import type { IAnalytics } from '../../../types/models';
import { Types } from 'mongoose';

export class AnalyticsRepository extends BaseRepository<IAnalytics> {
  constructor() {
    super(Analytics);
  }

  async trackEvent(data: Partial<IAnalytics>): Promise<IAnalytics> {
    return this.create(data);
  }

  async getWebsiteAnalytics(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalVisitors: { $addToSet: '$visitorId' },
          totalPageViews: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          bounceRate: { $avg: { $cond: ['$bounce', 1, 0] } },
        },
      },
    ]);
  }

  async getAnalyticsByPage(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$page', views: { $sum: 1 }, uniqueVisitors: { $addToSet: '$visitorId' } } },
      { $project: { page: '$_id', views: 1, uniqueVisitors: { $size: '$uniqueVisitors' }, _id: 0 } },
      { $sort: { views: -1 } },
    ]);
  }

  async getTrafficSources(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$referrer', count: { $sum: 1 }, uniqueVisitors: { $addToSet: '$visitorId' } } },
      { $project: { source: { $ifNull: ['$_id', 'direct'] }, count: 1, uniqueVisitors: { $size: '$uniqueVisitors' }, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getGeoData(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { country: '$country', city: '$city' }, count: { $sum: 1 } } },
      { $project: { country: '$_id.country', city: '$_id.city', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getDeviceStats(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $project: { device: '$_id', count: 1, _id: 0 } },
    ]);
  }

  async getHourlyTraffic(websiteId: string | Types.ObjectId, startDate: Date, endDate: Date) {
    return this.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          views: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      { $project: { hour: '$_id', views: 1, visitors: { $size: '$visitors' }, _id: 0 } },
      { $sort: { hour: 1 } },
    ]);
  }
}
