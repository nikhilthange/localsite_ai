import { SecurityMiddleware } from '../../src/core/security/SecurityMiddleware';
import { authMiddleware, adminMiddleware } from '../../src/core/security/AuthMiddleware';
import { AuthService } from '../../src/modules/auth/services/AuthService';

import { Logger } from '../../src/core/logging/Logger';

vi.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: vi.fn() } }));
vi.mock('../../src/core/logging/Logger', () => ({ Logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/modules/auth/repositories/AuthRepository', () => {
  const mock = { findByEmail: vi.fn(), findById: vi.fn(), addRefreshToken: vi.fn(), removeRefreshToken: vi.fn(), update: vi.fn() };
  return { AuthRepository: vi.fn().mockImplementation(() => mock) };
});
vi.mock('../../src/modules/auth/models/User', () => ({
  User: { create: vi.fn(), findOne: vi.fn(), findById: vi.fn() },
}));

describe('SecurityMiddleware', () => {
  describe('helmetConfig', () => {
    it('should return helmet middleware config', () => {
      const config = SecurityMiddleware.helmetConfig;
      expect(config).toBeDefined();
    });
  });

  describe('addSecurityHeaders', () => {
    it('should set security headers on response', () => {
      const req = {} as any;
      const res = {
        setHeader: vi.fn(),
        removeHeader: vi.fn(),
      } as any;
      const next = vi.fn();

      SecurityMiddleware.addSecurityHeaders(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', expect.any(String));
      expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    it('should log request details', () => {
      const req = { method: 'GET', path: '/api/test', user: { userId: 'user-1' } } as any;
      const res = {} as any;
      const next = vi.fn();
      const loggerSpy = vi.spyOn(Logger, 'info').mockImplementation();

      SecurityMiddleware.requestLogger(req, res, next);

      expect(loggerSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });

    it('should use anonymous for unauthenticated users', () => {
      const req = { method: 'POST', path: '/api/health', user: undefined } as any;
      const res = {} as any;
      const next = vi.fn();
      const loggerSpy = vi.spyOn(Logger, 'info').mockImplementation();

      SecurityMiddleware.requestLogger(req, res, next);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('anonymous'));
      loggerSpy.mockRestore();
    });
  });

  describe('csrfProtection', () => {
    it('should have csrf protection middleware', () => {
      expect(SecurityMiddleware.csrfProtection).toBeDefined();
      expect(typeof SecurityMiddleware.csrfProtection).toBe('function');
    });

    it('should have generateToken function', () => {
      expect(typeof SecurityMiddleware.generateCsrfToken).toBe('function');
    });
  });
});

describe('AuthMiddleware', () => {
  describe('authMiddleware', () => {
    it('should reject request without authorization header', () => {
      const req = { headers: {}, cookies: {} } as any;
      const res = {} as any;
      const next = vi.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should reject malformed token', () => {
      const req = { headers: { authorization: 'Bearer ' }, cookies: {} } as any;
      const res = {} as any;
      const next = vi.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should call next with user on valid token', () => {
      const token = AuthService.generateTokenPair('user-1', 'user', 'test@test.com').accessToken;
      const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} } as any;
      const res = {} as any;
      const next = vi.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('user-1');
    });
  });

  describe('adminMiddleware', () => {
    it('should allow admin users', () => {
      const req = { user: { role: 'admin' } } as any;
      const res = {} as any;
      const next = vi.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny non-admin users', () => {
      const req = { user: { role: 'user' } } as any;
      const res = {} as any;
      const next = vi.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should deny unauthenticated requests', () => {
      const req = { user: undefined } as any;
      const res = {} as any;
      const next = vi.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
