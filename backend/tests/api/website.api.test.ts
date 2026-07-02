import request from 'supertest';
import app from '../../src/app';
import { Website } from '../../src/modules/website/models/Website';
import { WebsiteRepository } from '../../src/modules/website/repositories/WebsiteRepository';
import { generateTestToken } from '../helpers';

vi.mock('../../src/modules/website/models/Website', () => ({
  Website: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('../../src/modules/website/repositories/WebsiteRepository', () => {
  const mock = {
    create: vi.fn(),
    findById: vi.fn(),
    findBySubdomain: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getWebsitesByUserPaginated: vi.fn(),
    getWebsiteWithDetails: vi.fn(),
    getAllWebsitesPaginated: vi.fn(),
    searchByName: vi.fn(),
    count: vi.fn(),
    getWebsiteCount: vi.fn(),
  };
  return { WebsiteRepository: vi.fn().mockImplementation(() => mock) };
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

describe('Website API', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(() => {
    userToken = generateTestToken({ userId: 'user-1', role: 'user' });
    adminToken = generateTestToken({ userId: 'admin-1', role: 'admin' });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/websites', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/websites');
      expect(res.status).toBe(401);
    });

    it('should return 200 with websites for authenticated user', async () => {
      const mockRepo = (WebsiteRepository as vi.Mock).mock.results[0]?.value;

      (Website.find as vi.Mock).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      });
      (Website.countDocuments as vi.Mock).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/websites')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe.skip('POST /api/websites/:id/generate', () => {
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
      (Website.findById as vi.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/websites/nonexistent')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });
});
