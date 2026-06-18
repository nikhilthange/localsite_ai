import { Response, NextFunction } from 'express';
import { AuthService } from '../../modules/auth/services/AuthService';
import { AuthenticatedRequest } from '../../types/express';
import { UnauthorizedError, ForbiddenError } from '../../utils/AppError';

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

export function adminMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(new ForbiddenError('Admin access required'));
    return;
  }
  next();
}

export function agencyMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'agency_owner' && req.user?.role !== 'admin') {
    next(new ForbiddenError('Agency access required'));
    return;
  }
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // Token invalid or expired — continue without user
  }

  next();
}
