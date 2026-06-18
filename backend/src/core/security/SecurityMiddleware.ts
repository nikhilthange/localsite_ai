import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { AuthenticatedRequest } from '../../types/express';

const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'dev-csrf-secret',
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export class SecurityMiddleware {
  static helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "*.s3.amazonaws.com", "*.cloudflare.com"],
        connectSrc: ["'self'", "wss://*.localsiteai.com"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  static csrfProtection = csrfProtection.doubleCsrfProtection;
  static generateCsrfToken = csrfProtection.generateToken;

  static mongoSanitize = mongoSanitize();
  static xssClean = xss();
  static hppProtection = hpp({
    whitelist: ['price', 'rating', 'createdAt', 'page', 'limit', 'sort'],
  });

  static requestLogger(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const userId = req.user?.userId || 'anonymous';
    console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.path + ' - User: ' + userId);
    next();
  }

  static addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
  }
}
