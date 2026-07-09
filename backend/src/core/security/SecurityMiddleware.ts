import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import mongoSanitize from 'express-mongo-sanitize';
import { filterXSS } from 'xss';
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
        scriptSrc: ["'self'", "cdnjs.cloudflare.com"], // TODO: replace with nonce-based strict CSP
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

  static csrfProtection = (process.env.NODE_ENV === 'test' || (process.env.DISABLE_CSRF === 'true' && process.env.NODE_ENV !== 'production'))
    ? (() => { const noop: any = (_req: Request, _res: Response, next: NextFunction) => next(); return noop; })()
    : csrfProtection.doubleCsrfProtection;
  static generateCsrfToken = csrfProtection.generateToken;

  static mongoSanitize = mongoSanitize();
  static xssClean(req: Request, _res: Response, next: NextFunction): void {
    const sanitize = (obj: Record<string, unknown>) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = filterXSS(obj[key] as string);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key] as Record<string, unknown>);
        }
      }
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query as Record<string, unknown>);
    if (req.params) sanitize(req.params);
    next();
  }
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
    
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
  }
}
