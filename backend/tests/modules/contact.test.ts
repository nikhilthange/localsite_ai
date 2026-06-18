import { ContactService } from '../../src/modules/contact/services/ContactService';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/contact/repositories/ContactRepository', () => {
  const mock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByWebsite: jest.fn(),
  };
  (global as any).__mockContactRepo = mock;
  return { ContactRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/modules/website/models/Website', () => ({
  Website: {
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: jest.fn() } }));

jest.mock('../../src/core/queue/QueueService', () => ({
  QueueService: { addJob: jest.fn() },
  QueueNames: { NOTIFICATION: 'notification' },
}));

const mockRepo = (global as any).__mockContactRepo;

const mockWebsiteDoc = (val: any) => ({
  lean: jest.fn().mockResolvedValue(val),
});

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContactService();
  });

  describe('submitForm', () => {
    it('should create a contact form submission', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findById as jest.Mock).mockReturnValue(mockWebsiteDoc({
        _id: VALID_ID, userId: VALID_ID, name: 'Test Site',
      }));

      const submission = { _id: 'contact-1', name: 'John Doe', email: 'john@example.com', message: 'I need a website', source: 'website' };
      mockRepo.create.mockResolvedValue(submission);

      const result = await service.submitForm({
        websiteId: VALID_ID, name: 'John Doe', email: 'john@example.com', message: 'I need a website',
      });

      expect(result).toBe(submission);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe', email: 'john@example.com', source: 'website' })
      );
    });

    it('should throw if website not found', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findById as jest.Mock).mockReturnValue(mockWebsiteDoc(null));

      await expect(
        service.submitForm({ websiteId: 'nonexistent', name: 'John', email: 'john@example.com', message: 'Hello' })
      ).rejects.toThrow('Website not found');
    });
  });

  describe('getContactsByWebsite', () => {
    it('should return paginated contacts for owned website', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockWebsiteDoc({ _id: VALID_ID, userId: VALID_ID }));

      const paginatedResult = {
        data: [{ _id: 'contact-1', name: 'Jane', email: 'jane@example.com' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepo.findByWebsite.mockResolvedValue(paginatedResult);

      const result = await service.getContactsByWebsite(VALID_ID, VALID_ID, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(mockRepo.findByWebsite).toHaveBeenCalledWith(VALID_ID, { page: 1, limit: 20 });
    });

    it('should throw if website not owned', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockWebsiteDoc(null));

      await expect(service.getContactsByWebsite(VALID_ID, 'other-user', { page: 1, limit: 20 })).rejects.toThrow('Website not found');
    });
  });

  describe('getContactById', () => {
    it('should return a contact by ID for authorized user', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockWebsiteDoc({ _id: VALID_ID, userId: VALID_ID }));

      const contact = { _id: 'contact-1', name: 'Jane', email: 'jane@example.com', websiteId: VALID_ID };
      mockRepo.findById.mockResolvedValue(contact);

      const result = await service.getContactById('contact-1', VALID_ID);
      expect(result).toBe(contact);
    });

    it('should throw if contact not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getContactById('nonexistent', VALID_ID)).rejects.toThrow('Contact not found');
    });

    it('should throw if unauthorized', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockWebsiteDoc(null));

      mockRepo.findById.mockResolvedValue({ _id: 'contact-1', name: 'Jane', websiteId: VALID_ID });

      await expect(service.getContactById('contact-1', 'other-user')).rejects.toThrow('Unauthorized');
    });
  });
});
