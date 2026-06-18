import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { AnalyticsService } from '../services/AnalyticsService';
import { Request } from 'express';

const analyticsService = new AnalyticsService();

export const track = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await analyticsService.trackPageView(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const websiteStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { start, end } = req.query;
    const dateRange = {
      start: start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: end ? new Date(end as string) : new Date(),
    };
    const stats = await analyticsService.getWebsiteStats(req.params.websiteId, dateRange);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const dashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as '7d' | '30d' | '90d') || '30d';
    const data = await analyticsService.getDashboardData(req.params.websiteId, period);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
