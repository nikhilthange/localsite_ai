import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { ContactService } from '../services/ContactService';
import { Request } from 'express';

const contactService = new ContactService();

export const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.submitForm(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

export const getByWebsite = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sort, order } = req.query;
    const result = await contactService.getContactsByWebsite(
      req.params.websiteId,
      req.user!.userId,
      {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sort: sort as string,
        order: order as 'asc' | 'desc',
      }
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.getContactById(req.params.id, req.user!.userId);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};
