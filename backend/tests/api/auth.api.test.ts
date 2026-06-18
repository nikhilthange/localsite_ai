import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/modules/auth/models/User';

jest.mock('../../src/modules/auth/models/User', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

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

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
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
      expect(res.body.data).toHaveProperty('token');
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
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 for valid email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'user-1',
        email: 'exists@example.com',
        name: 'Exists',
        save: jest.fn(),
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'exists@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should still return 200 for non-existent email (security)', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'noone@example.com' });
      expect(res.status).toBe(200);
    });
  });
});
