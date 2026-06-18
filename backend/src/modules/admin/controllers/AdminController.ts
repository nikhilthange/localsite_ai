import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { AdminService } from '../services/AdminService';
import { AppError } from '../../../utils/AppError';

const adminService = new AdminService();

export const dashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await adminService.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};

export const users = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order, search, role } = req.query;
    const result = await adminService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string,
      role: role as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const userDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getUserDetails(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!role) throw new AppError('Role is required', 400);
    const user = await adminService.updateUserRole(req.params.id, role);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const toggleStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const websites = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order, search, status } = req.query;
    const result = await adminService.getWebsites({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string,
      status: status as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const payments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order, status } = req.query;
    const result = await adminService.getPayments({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      status: status as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const systemLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order, userId, action } = req.query;
    const result = await adminService.getSystemLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      userId: userId as string,
      action: action as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const analytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const overview = await adminService.getAnalyticsOverview();
    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
};
