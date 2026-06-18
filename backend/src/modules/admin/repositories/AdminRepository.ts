import { BaseRepository } from '../../../core/database/BaseRepository';
import { User } from '../../auth/models/User';
import { Website } from '../../website/models/Website';
import { Payment } from '../../payment/models/Payment';
import { Subscription } from '../../payment/models/Subscription';
import { AuditRepository } from '../../audit/repositories/AuditRepository';
import type { IUser } from '../../../types/models';
import type { PaginationParams } from '../../../types/services';
import { Types } from 'mongoose';
import { escapeRegex } from '../../../utils/helpers';

export class AdminRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async getUserStats(): Promise<{ total: number; active: number; byRole: Record<string, number> }> {
    const [total, active, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);
    const roleMap: Record<string, number> = {};
    for (const r of byRole) {
      roleMap[r._id] = r.count;
    }
    return { total, active, byRole: roleMap };
  }

  async getWebsiteStats(): Promise<{ total: number; published: number; draft: number }> {
    const [total, published, draft] = await Promise.all([
      Website.countDocuments(),
      Website.countDocuments({ status: 'published' }),
      Website.countDocuments({ status: 'draft' }),
    ]);
    return { total, published, draft };
  }

  async getRevenueStats(): Promise<{ mrr: number; arr: number; total: number; byMonth: Array<{ month: string; amount: number }> }> {
    const [total, monthly] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            amount: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const totalRevenue = total[0]?.total || 0;
    const recent = monthly.slice(-3);
    const avgMonthly = recent.length > 0
      ? Math.round(recent.reduce((s, m) => s + m.amount, 0) / recent.length)
      : 0;
    return {
      mrr: avgMonthly,
      arr: avgMonthly * 12,
      total: totalRevenue,
      byMonth: monthly.map((m) => ({ month: m._id, amount: m.amount })),
    };
  }

  async getSubscriptionStats(): Promise<{
    total: number; active: number; byPlan: Record<string, number>; churnRate: number
  }> {
    const [total, active, byPlan, cancelled] = await Promise.all([
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]),
      Subscription.countDocuments({ status: 'cancelled' }),
    ]);
    const planMap: Record<string, number> = {};
    for (const p of byPlan) {
      planMap[p._id] = p.count;
    }
    const churnRate = total > 0 ? Math.round((cancelled / total) * 10000) / 100 : 0;
    return { total, active, byPlan: planMap, churnRate };
  }

  async getAiUsageStats(): Promise<{
    totalRequests: number; avgTokensPerRequest: number; totalTokens: number
  }> {
    const result = await BaseRepository.prototype.aggregate.call(
      { model: User } as any,
      [
        { $group: { _id: null, totalRequests: { $sum: '$aiUsage.requests' }, totalTokens: { $sum: '$aiUsage.tokens' } } },
      ]
    );
    const stats = result[0] || { totalRequests: 0, totalTokens: 0 };
    return {
      totalRequests: stats.totalRequests,
      avgTokensPerRequest: stats.totalRequests > 0 ? Math.round(stats.totalTokens / stats.totalRequests) : 0,
      totalTokens: stats.totalTokens,
    };
  }

  async getUsers(params: PaginationParams & { search?: string; role?: string }) {
    const filter: Record<string, any> = {};
    if (params.search) {
      const escaped = escapeRegex(params.search);
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (params.role) filter.role = params.role;
    return this.paginate(filter, params);
  }

  async getUserDetails(id: string) {
    const user = await User.findById(id).populate('subscription').lean();
    if (!user) throw new Error('User not found');
    const websites = await Website.find({ userId: id }).lean();
    const payments = await Payment.find({ userId: id }).sort({ createdAt: -1 }).limit(10).lean();
    return { user, websites, payments };
  }

  async updateUserRole(id: string, role: string) {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
    if (!user) throw new Error('User not found');
    return user;
  }

  async toggleUserStatus(id: string) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  async getWebsites(params: PaginationParams & { search?: string; status?: string }) {
    const filter: Record<string, any> = {};
    if (params.search) {
      const escaped = escapeRegex(params.search);
      filter.$or = [
        { businessName: { $regex: escaped, $options: 'i' } },
        { subdomain: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (params.status) filter.status = params.status;
    const websiteRepo = new (class extends BaseRepository<any> {
      constructor() { super(Website); }
    })();
    return websiteRepo.paginate(filter, params);
  }

  async getPayments(params: PaginationParams & { status?: string }) {
    const filter: Record<string, any> = {};
    if (params.status) filter.status = params.status;
    const paymentRepo = new (class extends BaseRepository<any> {
      constructor() { super(Payment); }
    })();
    return paymentRepo.paginate(filter, params);
  }

  async getSystemLogs(params: PaginationParams & { userId?: string; action?: string }) {
    const auditRepo = new AuditRepository();
    return auditRepo.getSystemLogs(params);
  }
}
