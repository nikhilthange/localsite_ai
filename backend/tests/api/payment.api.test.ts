import request from 'supertest';
import app from '../../src/app';
import { generateTestToken } from '../helpers';

jest.mock('../../src/modules/payment/models/Subscription', () => ({
  Subscription: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('../../src/modules/payment/models/Payment', () => ({
  Payment: {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../src/modules/payment/repositories/PaymentRepository', () => {
  const mock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByProviderPaymentId: jest.fn(),
    updateOne: jest.fn(),
    paginate: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  };
  return { PaymentRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/modules/payment/repositories/SubscriptionRepository', () => {
  const mock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByProviderId: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };
  return { SubscriptionRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/modules/payment/services/PaymentService', () => {
  const mock = {
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    getSubscriptionStatus: jest.fn(),
    getPaymentHistory: jest.fn(),
    processStripeWebhook: jest.fn(),
    processRazorpayWebhook: jest.fn(),
    getPlans: jest.fn(),
  };
  return { PaymentService: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/core/events/EventBus', () => ({
  EventBus: { emit: jest.fn(), initialize: jest.fn(), on: jest.fn() },
}));

jest.mock('../../src/core/database/Connection', () => ({
  DatabaseConnection: {
    getInstance: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      getConnection: jest.fn(() => ({ readyState: 1 })),
    })),
  },
}));

describe('Payment API', () => {
  let userToken: string;

  beforeAll(() => {
    userToken = generateTestToken({ userId: 'user-1', role: 'user' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payments/plans', () => {
    it('should return available plans', async () => {
      const { PaymentService } = require('../../src/modules/payment/services/PaymentService');
      const mockInstance = (PaymentService as jest.Mock).mock.results[0]?.value;
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

  describe('POST /api/payments/subscriptions', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/payments/subscriptions')
        .send({ plan: 'professional', period: 'monthly', provider: 'stripe' });
      expect(res.status).toBe(401);
    });
  });
});
