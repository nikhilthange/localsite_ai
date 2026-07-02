import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/modules/auth/models/User';

vi.mock('../../src/modules/auth/models/User', () => {
  const createQuery = (resolveValue: any = null) => ({
    lean: vi.fn().mockResolvedValue(resolveValue),
    select: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled),
    catch: (onRejected: any) => Promise.resolve(resolveValue).catch(onRejected),
  });

  return {
    User: {
      create: vi.fn(),
      findOne: vi.fn(() => createQuery()),
      findById: vi.fn(() => createQuery()),
      findByIdAndUpdate: vi.fn(() => createQuery()),
      findByIdAndDelete: vi.fn(() => createQuery()),
    },
  };
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

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'P@ssw0rd123' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: '123' });
      expect(res.status).toBe(400);
    });

    it('should return 200 with tokens on successful registration', async () => {
      (User.create as vi.Mock).mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        toObject: () => ({
          _id: '507f1f77bcf86cd799439011',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        }),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'newuser@example.com', password: 'P@ssw0rd123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('user');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      (User.findOne as vi.Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 for valid email', async () => {
      (User.findOne as vi.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: 'user-1',
          email: 'exists@example.com',
          name: 'Exists',
          save: vi.fn(),
        }),
        select: vi.fn().mockReturnThis(),
        then: (fn: any) => Promise.resolve(undefined).then(fn),
        catch: (fn: any) => Promise.resolve(undefined).catch(fn),
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'exists@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should still return 200 for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'noone@example.com' });
      expect(res.status).toBe(200);
    });
  });
});
