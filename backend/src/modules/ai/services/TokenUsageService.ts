import { AiUsageLog } from '../models/AiUsageLog';
import { User } from '../../auth/models/User';
import { AITaskType, AIModel, TokenUsageRecord, AiUsageSummary } from '../types';
import { Logger } from '../../../core/logging/Logger';
import { CacheService } from '../../../core/cache/CacheService';
import { Types } from 'mongoose';

export class TokenUsageService {

  async recordUsage(record: TokenUsageRecord): Promise<void> {
    try {
      await AiUsageLog.create({
        userId: new Types.ObjectId(record.userId),
        websiteId: record.websiteId ? new Types.ObjectId(record.websiteId) : undefined,
        taskType: record.taskType,
        model: record.model,
        promptTokens: record.promptTokens,
        completionTokens: record.completionTokens,
        totalTokens: record.totalTokens,
        cost: record.cost,
        creditsConsumed: record.creditsConsumed,
        latency: record.latency,
        cached: record.cached,
        success: record.success,
        error: record.error,
      });

      await User.updateOne(
        { _id: new Types.ObjectId(record.userId) },
        {
          $inc: {
            'aiUsage.requests': 1,
            'aiUsage.tokens': record.totalTokens,
          },
          $set: { 'aiUsage.lastRequestAt': new Date() },
        }
      );

      const cacheKey = `ai:usage:summary:${record.userId}`;
      await CacheService.del(cacheKey);
    } catch (error) {
      Logger.error('Failed to record AI usage', {
        userId: record.userId,
        error: (error as Error).message,
      });
    }
  }

  async getUserSummary(userId: string): Promise<AiUsageSummary> {
    const cacheKey = `ai:usage:summary:${userId}`;
    const cached = await CacheService.get<AiUsageSummary>(cacheKey);
    if (cached) return cached;

    const logs = await AiUsageLog.find({ userId: new Types.ObjectId(userId) }).lean();
    const summary: AiUsageSummary = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      totalCreditsConsumed: 0,
      byTaskType: {} as Record<AITaskType, { requests: number; tokens: number; cost: number }>,
      byModel: {} as Record<AIModel, { requests: number; tokens: number; cost: number }>,
    };

    for (const log of logs) {
      summary.totalRequests++;
      summary.totalTokens += log.totalTokens;
      summary.totalCost += log.cost;
      summary.totalCreditsConsumed += log.creditsConsumed;

      if (!summary.byTaskType[log.taskType as AITaskType]) {
        summary.byTaskType[log.taskType as AITaskType] = { requests: 0, tokens: 0, cost: 0 };
      }
      summary.byTaskType[log.taskType as AITaskType].requests++;
      summary.byTaskType[log.taskType as AITaskType].tokens += log.totalTokens;
      summary.byTaskType[log.taskType as AITaskType].cost += log.cost;

      if (!summary.byModel[log.model as AIModel]) {
        summary.byModel[log.model as AIModel] = { requests: 0, tokens: 0, cost: 0 };
      }
      summary.byModel[log.model as AIModel].requests++;
      summary.byModel[log.model as AIModel].tokens += log.totalTokens;
      summary.byModel[log.model as AIModel].cost += log.cost;
    }

    await CacheService.set(cacheKey, summary, 300);
    return summary;
  }

  async getAdminSummary(timeRange?: { start: Date; end: Date }): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    totalCreditsConsumed: number;
    topUsers: Array<{ userId: string; requests: number; tokens: number; cost: number }>;
    usageByDay: Array<{ date: string; requests: number; tokens: number; cost: number }>;
  }> {
    const matchStage: Record<string, any> = {};
    if (timeRange) {
      matchStage.createdAt = { $gte: timeRange.start, $lte: timeRange.end };
    }

    const [aggregated, topUsers, dailyUsage] = await Promise.all([
      AiUsageLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalTokens: { $sum: '$totalTokens' },
            totalCost: { $sum: '$cost' },
            totalCreditsConsumed: { $sum: '$creditsConsumed' },
          },
        },
      ]),
      AiUsageLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            requests: { $sum: 1 },
            tokens: { $sum: '$totalTokens' },
            cost: { $sum: '$cost' },
          },
        },
        { $sort: { requests: -1 } },
        { $limit: 20 },
        {
          $project: {
            userId: { $toString: '$_id' },
            requests: 1,
            tokens: 1,
            cost: 1,
            _id: 0,
          },
        },
      ]),
      AiUsageLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            requests: { $sum: 1 },
            tokens: { $sum: '$totalTokens' },
            cost: { $sum: '$cost' },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            requests: 1,
            tokens: 1,
            cost: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    return {
      totalRequests: aggregated[0]?.totalRequests || 0,
      totalTokens: aggregated[0]?.totalTokens || 0,
      totalCost: aggregated[0]?.totalCost || 0,
      totalCreditsConsumed: aggregated[0]?.totalCreditsConsumed || 0,
      topUsers,
      usageByDay: dailyUsage,
    };
  }

  async getUsageByDateRange(userId: string, start: Date, end: Date): Promise<{
    requests: number;
    tokens: number;
    cost: number;
    creditsConsumed: number;
  }> {
    const result = await AiUsageLog.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          tokens: { $sum: '$totalTokens' },
          cost: { $sum: '$cost' },
          creditsConsumed: { $sum: '$creditsConsumed' },
        },
      },
    ]);

    return {
      requests: result[0]?.requests || 0,
      tokens: result[0]?.tokens || 0,
      cost: result[0]?.cost || 0,
      creditsConsumed: result[0]?.creditsConsumed || 0,
    };
  }
}
