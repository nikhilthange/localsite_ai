import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { IPayment } from '../../../types/models';
import { Payment } from '../models/Payment';

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(Payment);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IPayment[]> {
    return this.find({ userId } as any);
  }

  async findByProviderId(providerPaymentId: string): Promise<IPayment | null> {
    return this.findOne({ providerPaymentId } as any);
  }

  async getRevenueInRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  }

  async getSubscriptionPayments(subscriptionId: string | Types.ObjectId): Promise<IPayment[]> {
    return this.find({ subscriptionId } as any);
  }
}
