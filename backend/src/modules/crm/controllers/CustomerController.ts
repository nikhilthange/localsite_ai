import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { CustomerService } from '../services/CustomerService';

const customerService = new CustomerService();

export const getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { websiteId } = req.params;
    const { page, limit } = req.query;
    const result = await customerService.getCustomers(websiteId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.user!.userId);
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};
