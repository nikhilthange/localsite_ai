import { AdminRepository } from '../repositories/AdminRepository';
import type { PaginationParams } from '../../../types/services';
import type { UserRole } from '../../../types/models';

export class AdminService {
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  async getDashboardMetrics() {
    const [userStats, websiteStats, revenueStats, subscriptionStats, aiStats] = await Promise.all([
      this.repository.getUserStats(),
      this.repository.getWebsiteStats(),
      this.repository.getRevenueStats(),
      this.repository.getSubscriptionStats(),
      this.repository.getAiUsageStats(),
    ]);

    const previousMonth = revenueStats.byMonth[revenueStats.byMonth.length - 2];
    const currentMonth = revenueStats.byMonth[revenueStats.byMonth.length - 1];
    const growthPercent = previousMonth && currentMonth && previousMonth.amount > 0
      ? Math.round(((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 10000) / 100
      : 0;

    return {
      mrr: revenueStats.mrr,
      arr: revenueStats.arr,
      churn: subscriptionStats.churnRate,
      activeUsers: userStats.active,
      totalRevenue: revenueStats.total,
      aiRequests: aiStats.totalRequests,
      growthPercent,
      charts: {
        revenue: revenueStats.byMonth,
        subscriptions: subscriptionStats.byPlan,
        users: userStats.byRole,
        websites: { published: websiteStats.published, draft: websiteStats.draft },
      },
    };
  }

  async getUsers(params: PaginationParams & { search?: string; role?: string }) {
    return this.repository.getUsers(params);
  }

  async getUserDetails(id: string) {
    return this.repository.getUserDetails(id);
  }

  async updateUserRole(id: string, role: UserRole) {
    return this.repository.updateUserRole(id, role);
  }

  async toggleUserStatus(id: string) {
    return this.repository.toggleUserStatus(id);
  }

  async getWebsites(params: PaginationParams & { search?: string; status?: string }) {
    return this.repository.getWebsites(params);
  }

  async getPayments(params: PaginationParams & { status?: string }) {
    return this.repository.getPayments(params);
  }

  async getSystemLogs(params: PaginationParams & { userId?: string; action?: string }) {
    return this.repository.getSystemLogs(params);
  }

  async getAnalyticsOverview() {
    const [users, websites, payments, subscriptions] = await Promise.all([
      this.repository.getUserStats(),
      this.repository.getWebsiteStats(),
      this.repository.getRevenueStats(),
      this.repository.getSubscriptionStats(),
    ]);

    return {
      users,
      websites,
      revenue: {
        total: payments.total,
        mrr: payments.mrr,
        arr: payments.arr,
      },
      subscriptions,
    };
  }
}
