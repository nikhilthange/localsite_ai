import { PaymentService } from '../../src/modules/payment/services/PaymentService';
import { PaymentRepository } from '../../src/modules/payment/repositories/PaymentRepository';
import { SubscriptionRepository } from '../../src/modules/payment/repositories/SubscriptionRepository';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/payment/repositories/PaymentRepository');
jest.mock('../../src/modules/payment/repositories/SubscriptionRepository');
jest.mock('../../src/core/events/EventBus');

const MockedPaymentRepository = PaymentRepository as jest.MockedClass<typeof PaymentRepository>;
const MockedSubscriptionRepository = SubscriptionRepository as jest.MockedClass<typeof SubscriptionRepository>;

describe('PaymentService', () => {
  let service: PaymentService;
  let mockPaymentRepo: jest.Mocked<PaymentRepository>;
  let mockSubscriptionRepo: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentRepo = new MockedPaymentRepository() as jest.Mocked<PaymentRepository>;
    mockSubscriptionRepo = new MockedSubscriptionRepository() as jest.Mocked<SubscriptionRepository>;
    service = new PaymentService();
    (service as any).paymentRepository = mockPaymentRepo;
    (service as any).subscriptionRepository = mockSubscriptionRepo;
  });

  describe('createSubscription', () => {
    it('should create a subscription and payment', async () => {
      mockSubscriptionRepo.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepo.create.mockResolvedValue({
        _id: 'sub-1',
        plan: 'professional',
        status: 'trialing',
        price: 2999,
      } as any);
      mockPaymentRepo.create.mockResolvedValue({
        _id: 'pay-1',
        amount: 2999,
        status: 'pending',
      } as any);

      const result = await service.createSubscription(VALID_ID, 'professional', 'monthly', 'stripe');

      expect(result.subscription).toBeDefined();
      expect(result.payment).toBeDefined();
      expect(result.subscription.plan).toBe('professional');
    });

    it('should throw if user already has active subscription', async () => {
      mockSubscriptionRepo.findByUserId.mockResolvedValue({
        _id: 'sub-existing',
        status: 'active',
      } as any);

      await expect(
        service.createSubscription(VALID_ID, 'professional', 'monthly', 'stripe')
      ).rejects.toThrow('already has an active subscription');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel own subscription', async () => {
      mockSubscriptionRepo.findById.mockResolvedValue({
        _id: 'sub-1',
        userId: { toString: () => VALID_ID },
        plan: 'professional',
      } as any);
      mockSubscriptionRepo.update.mockResolvedValue({
        _id: 'sub-1',
        status: 'cancelled',
        cancelAtPeriodEnd: true,
      } as any);

      const result = await service.cancelSubscription(VALID_ID, 'sub-1');

      expect(result.status).toBe('cancelled');
    });

    it('should throw if subscription not found', async () => {
      mockSubscriptionRepo.findById.mockResolvedValue(null);

      await expect(
        service.cancelSubscription(VALID_ID, 'nonexistent')
      ).rejects.toThrow('Subscription not found');
    });

    it('should throw if unauthorized', async () => {
      mockSubscriptionRepo.findById.mockResolvedValue({
        _id: 'sub-1',
        userId: { toString: () => 'other-user-id-12345678' },
      } as any);

      await expect(
        service.cancelSubscription(VALID_ID, 'sub-1')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription for user', async () => {
      const subscription = { _id: 'sub-1', plan: 'professional', status: 'active' };
      mockSubscriptionRepo.findByUserId.mockResolvedValue(subscription as any);

      const result = await service.getSubscriptionStatus(VALID_ID);

      expect(result).toBe(subscription);
    });

    it('should return null if no subscription', async () => {
      mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus(VALID_ID);

      expect(result).toBeNull();
    });
  });

  describe('getPaymentHistory', () => {
    it('should return paginated payments', async () => {
      const paginatedResult = {
        data: [{ _id: 'pay-1', amount: 2999, status: 'succeeded' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockPaymentRepo.paginate.mockResolvedValue(paginatedResult as any);

      const result = await service.getPaymentHistory(VALID_ID, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('processStripeWebhook', () => {
    it('should handle checkout.session.completed', async () => {
      const event = { type: 'checkout.session.completed', data: { object: { id: 'cs_test_123' } } };
      mockPaymentRepo.updateOne.mockResolvedValue({} as any);

      await service.processStripeWebhook(event);

      expect(mockPaymentRepo.updateOne).toHaveBeenCalledWith(
        { providerPaymentId: 'cs_test_123' }, { status: 'succeeded' }
      );
    });

    it('should handle invoice.paid', async () => {
      const event = {
        type: 'invoice.paid',
        data: { object: { subscription: 'sub_provider_123', period_start: 1000000, period_end: 1000000 + 2592000 } },
      };
      mockSubscriptionRepo.findByProviderId.mockResolvedValue({ _id: 'sub-1' } as any);
      mockSubscriptionRepo.update.mockResolvedValue({} as any);

      await service.processStripeWebhook(event);

      expect(mockSubscriptionRepo.findByProviderId).toHaveBeenCalledWith('sub_provider_123');
    });

    it('should handle customer.subscription.deleted', async () => {
      const event = { type: 'customer.subscription.deleted', data: { object: { id: 'sub_provider_123' } } };
      mockSubscriptionRepo.findByProviderId.mockResolvedValue({
        _id: 'sub-1',
        userId: { toString: () => VALID_ID },
        plan: 'professional',
      } as any);
      mockSubscriptionRepo.update.mockResolvedValue({ status: 'expired' } as any);

      await service.processStripeWebhook(event);

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('sub-1', { status: 'expired' });
    });
  });

  describe('processRazorpayWebhook', () => {
    it('should handle payment.captured', async () => {
      const event = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_rzp_123' } } } };
      mockPaymentRepo.updateOne.mockResolvedValue({} as any);

      await service.processRazorpayWebhook(event);

      expect(mockPaymentRepo.updateOne).toHaveBeenCalledWith(
        { providerPaymentId: 'pay_rzp_123' }, { status: 'succeeded' }
      );
    });
  });
});
