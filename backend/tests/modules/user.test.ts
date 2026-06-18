import { UserService } from '../../src/modules/user/services/UserService';
import { User } from '../../src/modules/auth/models/User';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compare: jest.fn(),
  genSalt: jest.fn(() => Promise.resolve('fake-salt')),
  hash: jest.fn((pwd: string) => Promise.resolve(`hashed:${pwd}`)),
}));

jest.mock('../../src/modules/user/repositories/UserRepository', () => {
  const mock = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    updatePreferences: jest.fn(),
    getAllUsers: jest.fn(),
    count: jest.fn(),
    paginate: jest.fn(),
  };
  (global as any).__mockUserRepository = mock;
  return { UserRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/modules/auth/models/User', () => ({
  User: { findById: jest.fn(), aggregate: jest.fn() },
}));

const mockUserRepository = (global as any).__mockUserRepository;
const bcrypt = jest.requireMock('bcryptjs');

describe('UserService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userData = { _id: VALID_ID, name: 'Test User', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(userData);

      const result = await UserService.getProfile(VALID_ID);
      expect(result).toEqual(userData);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(VALID_ID);
    });

    it('should throw NotFoundError for missing user', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(UserService.getProfile('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update and return user', async () => {
      const updatedUser = { _id: VALID_ID, name: 'Updated', email: 'test@example.com' };
      mockUserRepository.updateProfile.mockResolvedValue(updatedUser);

      const result = await UserService.updateProfile(VALID_ID, { name: 'Updated' } as any);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepository.updateProfile.mockResolvedValue(null);
      await expect(UserService.updateProfile('x', { name: 'N' } as any)).rejects.toThrow('User not found');
    });
  });

  describe('updatePassword', () => {
    it('should update password with valid current password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ password: 'hashed-old', save: jest.fn().mockResolvedValue(true) }) });

      await UserService.updatePassword(VALID_ID, 'OldP@ss123', 'NewP@ss456');
    });

    it('should throw on incorrect current password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ password: 'hashed-real' }) });

      await expect(UserService.updatePassword(VALID_ID, 'WrongP@ss', 'NewP@ss456')).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      mockUserRepository.findById.mockResolvedValue({ preferences: { theme: 'dark', notifications: true, emailReports: false } });
      const result = await UserService.getPreferences(VALID_ID);
      expect(result.theme).toBe('dark');
    });
  });

  describe('updatePreferences', () => {
    it('should update and return preferences', async () => {
      mockUserRepository.updatePreferences.mockResolvedValue({ _id: VALID_ID, preferences: { theme: 'dark', notifications: true, emailReports: false } });
      const result = await UserService.updatePreferences(VALID_ID, { theme: 'dark' as any });
      expect(result.theme).toBe('dark');
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      mockUserRepository.getAllUsers.mockResolvedValue({
        data: [{ _id: VALID_ID, name: 'Test' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });
      const result = await UserService.getUsers({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      mockUserRepository.count.mockResolvedValueOnce(100).mockResolvedValueOnce(75).mockResolvedValueOnce(10);
      (User.aggregate as jest.Mock).mockResolvedValue([{ _id: 'user', count: 80 }, { _id: 'admin', count: 20 }]);

      const analytics = await UserService.getUserAnalytics();
      expect(analytics.totalUsers).toBe(100);
      expect(analytics.byRole.user).toBe(80);
    });
  });
});
