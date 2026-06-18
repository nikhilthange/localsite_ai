import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../types/express';
import { DeploymentService } from '../services/DeploymentService';

const deploymentService = new DeploymentService();

export const deploy = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deployment = await deploymentService.deployWebsite(req.params.websiteId, req.user!.userId);
    res.status(201).json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

export const status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deployment = await deploymentService.getDeploymentStatus(req.params.deploymentId);
    res.json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

export const history = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deployments = await deploymentService.getDeploymentHistory(req.params.websiteId);
    res.json({ success: true, data: deployments });
  } catch (err) {
    next(err);
  }
};

export const setupDomain = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { domain } = req.body;
    if (!domain) throw new Error('Domain is required');
    const deployment = await deploymentService.setupCustomDomain(req.params.deploymentId, domain);
    res.json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

export const checkSsl = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deploymentService.checkSslStatus(req.params.deploymentId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
