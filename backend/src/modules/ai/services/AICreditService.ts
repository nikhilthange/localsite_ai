import { AiCredit, AiCreditTransaction } from '../models/AiCredit';
import { Subscription } from '../../payment/models/Subscription';
import { AITaskType, AICreditBalance, TASK_CREDIT_COSTS } from '../types';
import { Logger } from '../../../core/logging/Logger';
import { CacheService } from '../../../core/cache/CacheService';
import { Types } from 'mongoose';

const PLAN_CREDITS: Record<string, number> = {
  basic: 500,
  pro: 2000,
  business: 5000,
  enterprise: 20000,
};

const CREDIT_TOP_UP_AMOUNTS: Record<string, { credits: number; price: number }> = {
  small: { credits: 100, price: 2 },
  medium: { credits: 500, price: 8 },
  large: { credits: 2000, price: 25 },
  xl: { credits: 10000, price: 100 },
};

export class AICreditService {

  async getBalance(userId: string): Promise<AICreditBalance> {
    const cacheKey = `ai:credits:${userId}`;
    const cached = await CacheService.get<AICreditBalance>(cacheKey);
    if (cached) return cached;

    let credit = await AiCredit.findOne({ userId: new Types.ObjectId(userId) }).lean();
    if (!credit) {
      credit = await this.initializeCredits(userId);
    }

    const balance: AICreditBalance = {
      userId,
      balance: credit!.balance,
      lifetimeUsed: credit!.lifetimeUsed,
      lifetimePurchased: credit!.lifetimePurchased,
    };

    await CacheService.set(cacheKey, balance, 60);
    return balance;
  }

  async consumeCredits(userId: string, taskType: AITaskType, referenceId?: string): Promise<{ success: boolean; remaining: number; cost: number }> {
    const cost = TASK_CREDIT_COSTS[taskType];
    const objectId = new Types.ObjectId(userId);

    const credit = await AiCredit.findOne({ userId: objectId });
    if (!credit) {
      await this.initializeCredits(userId);
      const fresh = await AiCredit.findOne({ userId: objectId });
      if (!fresh || fresh.balance < cost) {
        return { success: false, remaining: fresh?.balance || 0, cost };
      }
    }

    const result = await AiCredit.findOneAndUpdate(
      { userId: objectId, balance: { $gte: cost } },
      { $inc: { balance: -cost, lifetimeUsed: cost } },
      { new: true }
    );

    if (!result) {
      const current = await AiCredit.findOne({ userId: objectId });
      return { success: false, remaining: current?.balance || 0, cost };
    }

    await AiCreditTransaction.create({
      userId: objectId,
      amount: -cost,
      type: 'consumption',
      taskType,
      description: `${taskType} generation (${cost} credits)`,
      referenceId,
    });

    await CacheService.del(`ai:credits:${userId}`);

    return { success: true, remaining: result.balance, cost };
  }

  async addCredits(
    userId: string,
    amount: number,
    type: 'consumption' | 'purchase' | 'bonus' | 'refund' | 'subscription_allotment',
    description: string,
    referenceId?: string
  ): Promise<number> {
    let credit = await AiCredit.findOne({ userId: new Types.ObjectId(userId) });
    if (!credit) {
      credit = await AiCredit.create({
        userId: new Types.ObjectId(userId),
        balance: 0,
        lifetimeUsed: 0,
        lifetimePurchased: 0,
      });
    }

    credit.balance += amount;
    if (type === 'purchase') {
      credit.lifetimePurchased += amount;
    }
    await credit.save();

    await AiCreditTransaction.create({
      userId: new Types.ObjectId(userId),
      amount,
      type,
      description,
      referenceId,
    });

    await CacheService.del(`ai:credits:${userId}`);

    return credit.balance;
  }

  async refundCredits(userId: string, taskType: AITaskType, referenceId: string): Promise<number> {
    const cost = TASK_CREDIT_COSTS[taskType];
    return this.addCredits(userId, cost, 'refund', `Refund for failed ${taskType}`, referenceId);
  }

  async getTransactionHistory(userId: string, limit = 50, skip = 0): Promise<{ transactions: any[]; total: number }> {
    const [transactions, total] = await Promise.all([
      AiCreditTransaction.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AiCreditTransaction.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        userId: t.userId.toString(),
        amount: t.amount,
        type: t.type,
        taskType: t.taskType,
        description: t.description,
        referenceId: t.referenceId ?? undefined,
      })),
      total,
    };
  }

  async getTopUpOptions(): Promise<typeof CREDIT_TOP_UP_AMOUNTS> {
    return CREDIT_TOP_UP_AMOUNTS;
  }

  async allotSubscriptionCredits(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId).lean();
    if (!subscription) {
      Logger.warn('Subscription not found for credit allotment', { subscriptionId });
      return;
    }

    const planKey = subscription.plan.toLowerCase();
    const credits = PLAN_CREDITS[planKey] || PLAN_CREDITS.basic;

    await this.addCredits(
      subscription.userId.toString(),
      credits,
      'subscription_allotment',
      `Monthly credit allotment for ${subscription.plan} plan (${credits} credits)`,
      subscriptionId
    );

    Logger.info('Subscription credits allotted', {
      userId: subscription.userId.toString(),
      plan: subscription.plan,
      credits,
    });
  }

  private async initializeCredits(userId: string): Promise<any> {
    const subscription = await Subscription.findOne({
      userId: new Types.ObjectId(userId),
      status: 'active',
    }).lean();

    const planKey = subscription?.plan?.toLowerCase() || 'basic';
    const initialCredits = PLAN_CREDITS[planKey] || PLAN_CREDITS.basic;

    const credit = await AiCredit.create({
      userId: new Types.ObjectId(userId),
      balance: initialCredits,
      lifetimeUsed: 0,
      lifetimePurchased: 0,
    });

    await AiCreditTransaction.create({
      userId: new Types.ObjectId(userId),
      amount: initialCredits,
      type: 'subscription_allotment',
      description: `Initial credit allotment for ${subscription?.plan || 'basic'} plan`,
    });

    Logger.info('Credits initialized for user', { userId, credits: initialCredits });
    return credit.toObject();
  }

  getPlanCredits(): Record<string, number> {
    return PLAN_CREDITS;
  }

  getTaskCreditCost(taskType: AITaskType): number {
    return TASK_CREDIT_COSTS[taskType];
  }
}
