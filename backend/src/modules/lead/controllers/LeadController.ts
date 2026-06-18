import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { LeadService } from '../services/LeadService';

const leadService = new LeadService();

export const getLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { websiteId } = req.params;
    const { page, limit, sort, order, status } = req.query;
    const result = await leadService.getLeads(websiteId, req.user!.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      status,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await leadService.updateLeadStatus(req.params.id, req.user!.userId, req.body.status);
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

export const assignLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await leadService.assignLead(req.params.id, req.user!.userId, req.body.assignedTo);
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};
