import { AuthService } from '../../src/modules/auth/services/AuthService';
import { User } from '../../src/modules/auth/models/User';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/auth/repositories/AuthRepository', () => {
  const mock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    addRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
    update: jest.fn(),
    clearRefreshTokens: jest.fn(),
    findByIdWithSubscription: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };
  (global as any).__mockAuthRepo = mock;
  return { AuthRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/modules/auth/models/User', () => ({
  User: { create: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: jest.fn() } }));

const repo = (global as any).__mockAuthRepo;

describe('AuthService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      repo.findByEmail.mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: { toString: () => VALID_ID }, name: 'Test', email: 'test@example.com', role: 'user',
        toObject: () => ({ _id: VALID_ID, name: 'Test', email: 'test@example.com', role: 'user' }),
      });
      repo.addRefreshToken.mockResolvedValue(null);

      const result = await AuthService.register('Test User', 'test@example.com', 'P@ssw0rd123');
      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw ConflictError when email already exists', async () => {
      repo.findByEmail.mockResolvedValue({ _id: VALID_ID } as any);
      await expect(AuthService.register('Test', 'e@e.com', 'P@ssw0rd123')).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: { toString: () => VALID_ID }, name: 'Test', email: 'test@example.com',
          role: 'user', password: bcrypt.hashSync('P@ssw0rd123', 12), emailVerified: true,
          toObject: () => ({ _id: VALID_ID, name: 'Test', email: 'test@example.com', role: 'user' }),
          save: jest.fn(),
        }),
      });
      repo.addRefreshToken.mockResolvedValue(null);
      repo.update.mockResolvedValue(null);

      const result = await AuthService.login('test@example.com', 'P@ssw0rd123');
      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw on invalid email', async () => {
      (User.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await expect(AuthService.login('bad@e.com', 'P@ss')).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh with valid token', async () => {
      const refreshToken = AuthService.generateTokenPair(VALID_ID, 'user', 'test@example.com').refreshToken;
      repo.findById.mockResolvedValue({ _id: { toString: () => VALID_ID }, role: 'user', email: 'test@example.com', refreshTokens: [refreshToken] } as any);
      repo.removeRefreshToken.mockResolvedValue(null);
      repo.addRefreshToken.mockResolvedValue(null);

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = AuthService.generateTokenPair(VALID_ID, 'admin', 'a@a.com').accessToken;
      expect(AuthService.verifyAccessToken(token).userId).toBe(VALID_ID);
    });

    it('should throw on invalid token', () => {
      expect(() => AuthService.verifyAccessToken('bad')).toThrow();
    });
  });
});
