import { AuthService } from '../../src/modules/auth/services/AuthService';
import { User } from '../../src/modules/auth/models/User';
import bcrypt from 'bcryptjs';

const VALID_ID = '507f1f77bcf86cd799439011';

vi.mock('../../src/modules/auth/repositories/AuthRepository', () => {
  const mock = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    addRefreshToken: vi.fn(),
    removeRefreshToken: vi.fn(),
    update: vi.fn(),
    clearRefreshTokens: vi.fn(),
    findByIdWithSubscription: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  };
  (global as any).__mockAuthRepo = mock;
  return { AuthRepository: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/modules/auth/models/User', () => ({
  User: { create: vi.fn(), findOne: vi.fn() },
}));

vi.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: vi.fn() } }));

const repo = (global as any).__mockAuthRepo;

describe('AuthService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      repo.findByEmail.mockResolvedValue(null);
      (User.create as vi.Mock).mockResolvedValue({
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
      (User.findOne as vi.Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: { toString: () => VALID_ID }, name: 'Test', email: 'test@example.com',
          role: 'user', password: bcrypt.hashSync('P@ssw0rd123', 12), emailVerified: true,
          toObject: () => ({ _id: VALID_ID, name: 'Test', email: 'test@example.com', role: 'user' }),
          save: vi.fn(),
        }),
      });
      repo.addRefreshToken.mockResolvedValue(null);
      repo.update.mockResolvedValue(null);

      const result = await AuthService.login('test@example.com', 'P@ssw0rd123');
      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw on invalid email', async () => {
      (User.findOne as vi.Mock).mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
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
