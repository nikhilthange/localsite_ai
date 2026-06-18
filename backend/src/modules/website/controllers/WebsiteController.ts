import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ControllerMethod } from '../../../types/express';
import { WebsiteService } from '../services/WebsiteService';

const websiteService = new WebsiteService();

export class WebsiteController {
  static create: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const website = await websiteService.createWebsite(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: website, message: 'Website created successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getAll: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await websiteService.getWebsites(req.user!.userId, req.query as any);
      res.status(200).json({ success: true, data: result, message: 'Websites retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getById: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const website = await websiteService.getWebsiteById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: website, message: 'Website retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static update: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const website = await websiteService.updateWebsite(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, data: website, message: 'Website updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  static delete: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await websiteService.deleteWebsite(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: null, message: 'Website deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  static generate: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await websiteService.generateWebsiteContent(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: null, message: 'Website generation queued successfully' });
    } catch (error) {
      next(error);
    }
  };

  static publish: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const website = await websiteService.publishWebsite(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: website, message: 'Website published successfully' });
    } catch (error) {
      next(error);
    }
  };

  static search: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const websites = await websiteService.searchWebsites(query);
      res.status(200).json({ success: true, data: websites, message: 'Search results retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
}
