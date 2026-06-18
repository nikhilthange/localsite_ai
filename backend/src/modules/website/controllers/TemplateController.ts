import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/TemplateService';

const templateService = new TemplateService();

export class TemplateController {
  static getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await templateService.getAll();
      res.status(200).json({ success: true, data: templates, message: 'Templates retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await templateService.getById(req.params.id);
      res.status(200).json({ success: true, data: template, message: 'Template retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await templateService.getByCategory(req.params.category);
      res.status(200).json({ success: true, data: templates, message: 'Templates retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await templateService.getBySlug(req.params.slug);
      res.status(200).json({ success: true, data: template, message: 'Template retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
}
