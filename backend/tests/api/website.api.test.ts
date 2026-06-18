import request from 'supertest';
import app from '../../src/app';
import { Website } from '../../src/modules/website/models/Website';
import { generateTestToken } from '../helpers';

jest.mock('../../src/modules/website/models/Website', () => ({
  Website: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('../../src/modules/website/repositories/WebsiteRepository', () => {
  const mock = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySubdomain: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getWebsitesByUserPaginated: jest.fn(),
    getWebsiteWithDetails: jest.fn(),
    getAllWebsitesPaginated: jest.fn(),
    searchByName: jest.fn(),
    count: jest.fn(),
    getWebsiteCount: jest.fn(),
  };
  return { WebsiteRepository: jest.fn().mockImplementation(() => mock) };
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

describe('Website API', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(() => {
    userToken = generateTestToken({ userId: 'user-1', role: 'user' });
    adminToken = generateTestToken({ userId: 'admin-1', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/websites', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/websites');
      expect(res.status).toBe(401);
    });

    it('should return 200 with websites for authenticated user', async () => {
      const { WebsiteRepository } = require('../../src/modules/website/repositories/WebsiteRepository');
      const mockRepo = (WebsiteRepository as jest.Mock).mock.results[0]?.value;

      (Website.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });
      (Website.countDocuments as jest.Mock).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/websites')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/websites/generate', () => {
    it('should return 400 for missing business info', async () => {
      const res = await request(app)
        .post('/api/websites/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/websites/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ businessName: 'Test', category: 'invalid-cat' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/websites/:id', () => {
    it('should return 404 for non-existent website', async () => {
      (Website.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/websites/nonexistent')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });
});
