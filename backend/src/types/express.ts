import { Request, Response, NextFunction } from 'express';
import { UserRole } from './auth';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email: string;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  sessionId?: string;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ControllerMethod = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
