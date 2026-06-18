import { WebsiteService } from '../../src/modules/website/services/WebsiteService';
import { WebsiteRepository } from '../../src/modules/website/repositories/WebsiteRepository';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/website/repositories/WebsiteRepository');

const MockedWebsiteRepository = WebsiteRepository as jest.MockedClass<typeof WebsiteRepository>;

describe('WebsiteService', () => {
  let service: WebsiteService;
  let mockRepository: jest.Mocked<WebsiteRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new MockedWebsiteRepository() as jest.Mocked<WebsiteRepository>;
    service = new WebsiteService();
    (service as any).repository = mockRepository;
  });

  describe('createWebsite', () => {
    it('should create a website with subdomain', async () => {
      const createData = {
        businessName: 'Test Biz',
        category: 'restaurant',
        location: 'NYC',
        phone: '+1 212-555-0100',
        email: 'test@biz.com',
      };

      const createdWebsite = {
        _id: VALID_ID,
        ...createData,
        subdomain: 'test-biz-a1b2',
        template: 'default',
        status: 'draft',
      };

      mockRepository.create.mockResolvedValue(createdWebsite as any);

      const result = await service.createWebsite(VALID_ID, createData);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      const callArg = mockRepository.create.mock.calls[0][0] as any;
      expect(callArg.businessName).toBe('Test Biz');
      expect(callArg.status).toBe('draft');
    });
  });

  describe('getWebsites', () => {
    it('should return paginated websites for user', async () => {
      const paginatedResult = {
        data: [{ _id: VALID_ID, businessName: 'Test Biz' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };

      mockRepository.getWebsitesByUserPaginated.mockResolvedValue(paginatedResult as any);

      const result = await service.getWebsites(VALID_ID, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(mockRepository.getWebsitesByUserPaginated).toHaveBeenCalledWith(VALID_ID, { page: 1, limit: 10 });
    });
  });

  describe('getWebsiteById', () => {
    it('should return website if owned by user', async () => {
      const website = {
        _id: VALID_ID,
        userId: { toString: () => VALID_ID },
        businessName: 'Test Biz',
      };

      mockRepository.getWebsiteWithDetails.mockResolvedValue(website as any);

      const result = await service.getWebsiteById(VALID_ID, VALID_ID);

      expect(result).toBe(website);
    });

    it('should throw ForbiddenError if not owned by user', async () => {
      const website = {
        _id: VALID_ID,
        userId: { toString: () => 'a1b2c3d4e5f6a7b8c9d0e1f2' },
        businessName: 'Test Biz',
      };

      mockRepository.getWebsiteWithDetails.mockResolvedValue(website as any);

      await expect(
        service.getWebsiteById(VALID_ID, VALID_ID)
      ).rejects.toThrow('You do not own this website');
    });

    it('should throw NotFoundError if website does not exist', async () => {
      mockRepository.getWebsiteWithDetails.mockResolvedValue(null);

      await expect(
        service.getWebsiteById(VALID_ID, VALID_ID)
      ).rejects.toThrow('Website not found');
    });
  });

  describe('updateWebsite', () => {
    it('should update owned website', async () => {
      const existing = {
        _id: VALID_ID,
        userId: { toString: () => VALID_ID },
      };
      const updated = { ...existing, businessName: 'Updated Biz' };

      mockRepository.findById.mockResolvedValue(existing as any);
      mockRepository.update.mockResolvedValue(updated as any);

      const result = await service.updateWebsite(VALID_ID, VALID_ID, { businessName: 'Updated Biz' } as any);

      expect(result).toBe(updated);
    });
  });

  describe('publishWebsite', () => {
    it('should publish a draft website', async () => {
      const website = {
        _id: VALID_ID,
        userId: { toString: () => VALID_ID },
        status: 'draft',
      };

      mockRepository.getWebsiteWithDetails.mockResolvedValue(website as any);
      const published = { ...website, status: 'published', publishedAt: expect.any(Date) };
      mockRepository.update.mockResolvedValue(published as any);

      const result = await service.publishWebsite(VALID_ID, VALID_ID);

      expect(result).toBe(published);
    });

    it('should return website if already published', async () => {
      const website = {
        _id: VALID_ID,
        userId: { toString: () => VALID_ID },
        status: 'published',
      };

      mockRepository.getWebsiteWithDetails.mockResolvedValue(website as any);

      const result = await service.publishWebsite(VALID_ID, VALID_ID);

      expect(result).toBe(website);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteWebsite', () => {
    it('should archive owned website', async () => {
      const website = {
        _id: VALID_ID,
        userId: { toString: () => VALID_ID },
      };

      mockRepository.findById.mockResolvedValue(website as any);
      mockRepository.update.mockResolvedValue({ ...website, status: 'archived' } as any);

      await service.deleteWebsite(VALID_ID, VALID_ID);

      expect(mockRepository.update).toHaveBeenCalledWith(VALID_ID, { status: 'archived' });
    });
  });

  describe('searchWebsites', () => {
    it('should search websites by name', async () => {
      const websites = [{ _id: VALID_ID, businessName: 'Test Biz' }];
      mockRepository.searchByName.mockResolvedValue(websites as any);

      const result = await service.searchWebsites('Test');

      expect(result).toHaveLength(1);
    });
  });
});
