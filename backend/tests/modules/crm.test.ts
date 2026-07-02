import { CustomerService } from '../../src/modules/crm/services/CustomerService';

const VALID_ID = '507f1f77bcf86cd799439011';

vi.mock('../../src/modules/crm/repositories/CustomerRepository', () => {
  const mock = {
    paginate: vi.fn(),
    findById: vi.fn(),
  };
  (global as any).__mockCrmRepo = mock;
  return { CustomerRepository: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/utils/AppError', () => {
  class NotFoundError extends Error {
    statusCode = 404;
    constructor(resource: string) {
      super(`${resource} not found`);
      this.name = 'NotFoundError';
    }
  }
  return { NotFoundError, AppError: class AppError extends Error { statusCode: number; constructor(msg: string, code: number) { super(msg); this.statusCode = code; } } };
});

const mockRepo = (global as any).__mockCrmRepo;

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerService();
  });

  describe('getCustomers', () => {
    it('should return paginated customers for a website', async () => {
      const result = {
        data: [{ _id: 'c-1', name: 'Customer 1', email: 'c1@test.com' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepo.paginate.mockResolvedValue(result);

      const customers = await service.getCustomers(VALID_ID, { page: 1, limit: 20 });

      expect(customers.data).toHaveLength(1);
      expect(mockRepo.paginate).toHaveBeenCalledWith({ websiteId: VALID_ID }, { page: 1, limit: 20 });
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', async () => {
      const customer = { _id: 'c-1', name: 'Acme Corp', email: 'contact@acme.com' };
      mockRepo.findById.mockResolvedValue(customer);

      const result = await service.getCustomerById('c-1');

      expect(result).toBe(customer);
    });

    it('should throw NotFoundError for missing customer', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getCustomerById('nonexistent')).rejects.toThrow('Customer not found');
    });
  });
});
