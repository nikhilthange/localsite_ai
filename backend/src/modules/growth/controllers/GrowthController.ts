import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { GrowthService } from '../services/GrowthService';

const growthService = new GrowthService();

export const dashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await growthService.getDashboard(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const websiteDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await growthService.getWebsiteDashboard(req.params.websiteId, req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const generateReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const report = await growthService.generateReport(req.params.websiteId, req.user!.userId);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order } = req.query;
    const result = await growthService.getReports(req.params.websiteId, req.user!.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getReportDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const report = await growthService.getReportDetail(req.params.reportId, req.user!.userId);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getTrends = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 8;
    const data = await growthService.getTrends(req.params.websiteId, req.user!.userId, weeks);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getInsights = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, websiteId, read, dismissed } = req.query;
    const result = await growthService.getInsights(req.user!.userId, websiteId as string, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      read: read !== undefined ? read === 'true' : undefined,
      dismissed: dismissed !== undefined ? dismissed === 'true' : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const insight = await growthService.markInsightRead(req.params.insightId, req.user!.userId);
    res.json({ success: true, data: insight });
  } catch (err) {
    next(err);
  }
};

export const dismissInsight = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const insight = await growthService.markInsightDismissed(req.params.insightId, req.user!.userId);
    res.json({ success: true, data: insight });
  } catch (err) {
    next(err);
  }
};
