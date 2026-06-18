import { AdminService } from '../../src/modules/admin/services/AdminService';
import { AdminRepository } from '../../src/modules/admin/repositories/AdminRepository';

jest.mock('../../src/modules/admin/repositories/AdminRepository');

const MockedAdminRepository = AdminRepository as jest.MockedClass<typeof AdminRepository>;

describe('AdminService', () => {
  let service: AdminService;
  let mockRepository: jest.Mocked<AdminRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new MockedAdminRepository() as jest.Mocked<AdminRepository>;
    service = new AdminService();
    (service as any).repository = mockRepository;
  });

  describe('getDashboardMetrics', () => {
    it('should return aggregated dashboard metrics', async () => {
      mockRepository.getUserStats.mockResolvedValue({
        total: 200, active: 150, byRole: { user: 130, admin: 20 },
      });
      mockRepository.getWebsiteStats.mockResolvedValue({
        total: 50, published: 35, draft: 15,
      });
      mockRepository.getRevenueStats.mockResolvedValue({
        mrr: 29900, arr: 358800, total: 500000,
        byMonth: [{ month: '2024-01', amount: 25000 }, { month: '2024-02', amount: 29900 }],
      });
      mockRepository.getSubscriptionStats.mockResolvedValue({
        total: 100, active: 75, byPlan: { starter: 40, professional: 25, business: 10 }, churnRate: 2.5,
      });
      mockRepository.getAiUsageStats.mockResolvedValue({
        totalRequests: 12500, avgTokensPerRequest: 450, totalTokens: 5625000,
      });

      const metrics = await service.getDashboardMetrics();

      expect(metrics.mrr).toBe(29900);
      expect(metrics.arr).toBe(358800);
      expect(metrics.activeUsers).toBe(150);
      expect(metrics.aiRequests).toBe(12500);
      expect(metrics.charts).toBeDefined();
      expect(metrics.growthPercent).toBeGreaterThan(0);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users with filters', async () => {
      const paginatedResult = {
        data: [{ _id: 'user-1', name: 'Test User', email: 'test@example.com' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepository.getUsers.mockResolvedValue(paginatedResult as any);

      const result = await service.getUsers({ page: 1, limit: 20, search: 'test', role: 'user' });

      expect(result.data).toHaveLength(1);
      expect(mockRepository.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20, search: 'test', role: 'user' });
    });
  });

  describe('getUserDetails', () => {
    it('should return user details with websites and payments', async () => {
      const userDetails = { user: { _id: 'user-1' }, websites: [{ _id: 'web-1' }], payments: [{ _id: 'pay-1' }] };
      mockRepository.getUserDetails.mockResolvedValue(userDetails as any);

      const result = await service.getUserDetails('user-1');

      expect(result.user).toBeDefined();
      expect(result.websites).toHaveLength(1);
      expect(result.payments).toHaveLength(1);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const updatedUser = { _id: 'user-1', name: 'Test', role: 'admin' };
      mockRepository.updateUserRole.mockResolvedValue(updatedUser as any);

      const result = await service.updateUserRole('user-1', 'admin');

      expect(result.role).toBe('admin');
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user active status', async () => {
      const toggledUser = { _id: 'user-1', isActive: false };
      mockRepository.toggleUserStatus.mockResolvedValue(toggledUser as any);

      const result = await service.toggleUserStatus('user-1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('getWebsites', () => {
    it('should return paginated websites', async () => {
      const result = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
      mockRepository.getWebsites.mockResolvedValue(result as any);

      const websites = await service.getWebsites({ page: 1, limit: 20, status: 'published' });

      expect(websites.data).toBeDefined();
    });
  });

  describe('getPayments', () => {
    it('should return paginated payments', async () => {
      const result = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
      mockRepository.getPayments.mockResolvedValue(result as any);

      const payments = await service.getPayments({ page: 1, limit: 20 });

      expect(payments.data).toBeDefined();
    });
  });
});
