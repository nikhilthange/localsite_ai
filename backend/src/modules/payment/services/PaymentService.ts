import { Types } from 'mongoose';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { IPayment, ISubscription } from '../../../types/models';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { NotFoundError } from '../../../utils/AppError';
import { PaginationParams, PaginatedResult } from '../../../types/services';
import { config } from '../../../config';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async createSubscription(
    userId: string,
    plan: string,
    interval: 'monthly' | 'yearly',
    provider: 'stripe' | 'razorpay'
  ): Promise<{ subscription: ISubscription; payment: IPayment }> {
    const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('User already has an active subscription');
    }

    const price = this.getPlanPrice(plan, interval);

    const subscription = await this.subscriptionRepository.create({
      userId: new Types.ObjectId(userId),
      plan,
      status: 'trialing',
      provider,
      providerSubscriptionId: `pending_${Date.now()}`,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      features: this.getPlanFeatures(plan),
      price,
      currency: provider === 'stripe' ? 'USD' : 'INR',
      interval,
    } as any);

    const payment = await this.paymentRepository.create({
      userId: new Types.ObjectId(userId),
      subscriptionId: subscription._id,
      amount: price,
      currency: provider === 'stripe' ? 'USD' : 'INR',
      provider,
      providerPaymentId: `pending_${Date.now()}`,
      status: 'pending',
      plan,
      interval,
    } as any);

    EventBus.emit(SystemEvents.SUBSCRIPTION_CREATED, {
      userId,
      plan,
      timestamp: new Date(),
    });

    return { subscription, payment };
  }

  async processStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.paymentRepository.updateOne(
          { providerPaymentId: session.id } as any,
          { status: 'succeeded' } as any
        );
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = await this.subscriptionRepository.findByProviderId(invoice.subscription);
        if (subscription) {
          await this.subscriptionRepository.update(subscription._id, {
            status: 'active',
            currentPeriodStart: new Date(invoice.period_start * 1000),
            currentPeriodEnd: new Date(invoice.period_end * 1000),
          } as any);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subData = event.data.object;
        await this.subscriptionRepository.updateOne(
          { providerSubscriptionId: subData.id } as any,
          {
            status: subData.cancel_at_period_end ? 'cancelled' : 'active',
            cancelAtPeriodEnd: subData.cancel_at_period_end,
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
          } as any
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subData = event.data.object;
        const subscription = await this.subscriptionRepository.findByProviderId(subData.id);
        if (subscription) {
          await this.subscriptionRepository.update(subscription._id, {
            status: 'expired',
          } as any);
          EventBus.emit(SystemEvents.SUBSCRIPTION_CANCELLED, {
            userId: subscription.userId.toString(),
            plan: subscription.plan,
            timestamp: new Date(),
          });
        }
        break;
      }
    }
  }

  async processRazorpayWebhook(event: any): Promise<void> {
    const { event: eventName, payload } = event;

    switch (eventName) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        await this.paymentRepository.updateOne(
          { providerPaymentId: payment.id } as any,
          { status: 'succeeded' } as any
        );
        break;
      }

      case 'subscription.charged': {
        const subscription = payload.subscription.entity;
        const existingSubscription = await this.subscriptionRepository.findByProviderId(subscription.id);
        if (existingSubscription) {
          await this.subscriptionRepository.update(existingSubscription._id, {
            status: 'active',
          } as any);
        }
        break;
      }

      case 'subscription.cancelled': {
        const subscription = payload.subscription.entity;
        const existingSubscription = await this.subscriptionRepository.findByProviderId(subscription.id);
        if (existingSubscription) {
          await this.subscriptionRepository.update(existingSubscription._id, {
            status: 'cancelled',
          } as any);
          EventBus.emit(SystemEvents.SUBSCRIPTION_CANCELLED, {
            userId: existingSubscription.userId.toString(),
            plan: existingSubscription.plan,
            timestamp: new Date(),
          });
        }
        break;
      }
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<ISubscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription');
    }
    if (subscription.userId.toString() !== userId) {
      throw new Error('Unauthorized to cancel this subscription');
    }

    const updated = await this.subscriptionRepository.update(subscriptionId, {
      status: 'cancelled',
      cancelAtPeriodEnd: true,
    } as any);

    if (!updated) {
      throw new NotFoundError('Subscription');
    }

    EventBus.emit(SystemEvents.SUBSCRIPTION_CANCELLED, {
      userId,
      plan: subscription.plan,
      timestamp: new Date(),
    });

    return updated;
  }

  async getSubscriptionStatus(userId: string): Promise<ISubscription | null> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getUserPayments(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<IPayment>> {
    return this.paymentRepository.paginate({ userId } as any, params);
  }

  async getPaymentHistory(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<IPayment>> {
    return this.paymentRepository.paginate(
      { userId, status: { $ne: 'pending' } } as any,
      { ...params, sort: 'createdAt', order: 'desc' }
    );
  }

  async handleFailedPayment(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    await this.subscriptionRepository.update(subscriptionId, {
      status: 'expired',
    } as any);

    EventBus.emit(SystemEvents.SUBSCRIPTION_EXPIRED, {
      userId: subscription.userId.toString(),
      plan: subscription.plan,
      timestamp: new Date(),
    });
  }

  private getPlanPrice(plan: string, interval: 'monthly' | 'yearly'): number {
    const prices: Record<string, Record<string, number>> = {
      starter: { monthly: 999, yearly: 9990 },
      professional: { monthly: 2999, yearly: 29990 },
      business: { monthly: 5999, yearly: 59990 },
      enterprise: { monthly: 9999, yearly: 99990 },
    };
    return prices[plan]?.[interval] || 999;
  }

  private getPlanFeatures(plan: string): string[] {
    const features: Record<string, string[]> = {
      starter: ['1 Website', 'Basic Templates', 'Standard Support'],
      professional: ['5 Websites', 'All Templates', 'AI Content Generation', 'Priority Support'],
      business: ['Unlimited Websites', 'All Templates', 'AI Content Generation', 'Custom Domain', 'Analytics', 'Priority Support'],
      enterprise: ['Unlimited Websites', 'All Templates', 'AI Content Generation', 'Custom Domain', 'Advanced Analytics', 'Dedicated Support', 'White Label'],
    };
    return features[plan] || features.starter;
  }
}
