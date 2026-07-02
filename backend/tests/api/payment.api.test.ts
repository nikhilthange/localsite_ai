import request from 'supertest';
import app from '../../src/app';
import { PaymentService } from '../../src/modules/payment/services/PaymentService';
import { generateTestToken } from '../helpers';

vi.mock('../../src/modules/payment/models/Subscription', () => ({
  Subscription: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('../../src/modules/payment/models/Payment', () => ({
  Payment: {
    find: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../../src/modules/payment/repositories/PaymentRepository', () => {
  const mock = {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByProviderPaymentId: vi.fn(),
    updateOne: vi.fn(),
    paginate: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn(),
  };
  return { PaymentRepository: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/modules/payment/repositories/SubscriptionRepository', () => {
  const mock = {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByProviderId: vi.fn(),
    update: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
  };
  return { SubscriptionRepository: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/modules/payment/services/PaymentService', () => {
  const mock = {
    createSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getSubscriptionStatus: vi.fn(),
    getPaymentHistory: vi.fn(),
    processStripeWebhook: vi.fn(),
    processRazorpayWebhook: vi.fn(),
    getPlans: vi.fn(),
  };
  return { PaymentService: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/core/events/EventBus', () => ({
  EventBus: { emit: vi.fn(), initialize: vi.fn(), on: vi.fn() },
}));

vi.mock('../../src/core/database/Connection', () => ({
  DatabaseConnection: {
    getInstance: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      getConnection: vi.fn(() => ({ readyState: 1 })),
    })),
  },
}));

describe('Payment API', () => {
  let userToken: string;

  beforeAll(() => {
    userToken = generateTestToken({ userId: 'user-1', role: 'user' });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.skip('GET /api/payments/plans', () => {
    it('should return available plans', async () => {
      const mockInstance = (PaymentService as vi.Mock).mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.getPlans.mockResolvedValue([
          { id: 'starter', name: 'Starter', price: 999 },
          { id: 'professional', name: 'Professional', price: 2999 },
        ]);
      }

      const res = await request(app)
        .get('/api/payments/plans')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/payments/subscribe', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/payments/subscribe')
        .send({ plan: 'professional', period: 'monthly', provider: 'stripe' });
      expect(res.status).toBe(401);
    });
  });
});
