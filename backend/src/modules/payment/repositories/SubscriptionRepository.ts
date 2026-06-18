import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { ISubscription } from '../../../types/models';
import { Subscription } from '../models/Subscription';

export class SubscriptionRepository extends BaseRepository<ISubscription> {
  constructor() {
    super(Subscription);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<ISubscription | null> {
    return this.findOne({ userId } as any);
  }

  async findByProviderId(providerSubscriptionId: string): Promise<ISubscription | null> {
    return this.findOne({ providerSubscriptionId } as any);
  }

  async getActiveSubscriptions(): Promise<ISubscription[]> {
    return this.find({ status: 'active' } as any);
  }

  async getExpiringSubscriptions(days: number): Promise<ISubscription[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.model.find({
      status: 'active',
      currentPeriodEnd: { $lte: expiryDate, $gte: new Date() },
    }).lean() as unknown as Promise<ISubscription[]>;
  }
}
