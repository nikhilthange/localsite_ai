import { LeadService } from '../../src/modules/lead/services/LeadService';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/lead/repositories/LeadRepository', () => {
  const mock = {
    findById: jest.fn(),
    findByWebsiteId: jest.fn(),
    findByEmail: jest.fn(),
    assignLead: jest.fn(),
    updateStatus: jest.fn(),
    getLeadsByUserWebsite: jest.fn(),
    paginate: jest.fn(),
  };
  (global as any).__mockLeadRepository = mock;
  return { LeadRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/core/events/EventBus', () => ({
  EventBus: { emit: jest.fn() },
}));

const mockLeadRepository = (global as any).__mockLeadRepository;

describe('LeadService', () => {
  let service: LeadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LeadService();
  });

  describe('getLeads', () => {
    it('should return paginated leads for a website', async () => {
      mockLeadRepository.getLeadsByUserWebsite.mockResolvedValue({
        data: [{ _id: VALID_ID, name: 'Jane Smith', email: 'jane@example.com', status: 'new' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      const result = await service.getLeads(VALID_ID, VALID_ID, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getLeadById', () => {
    it('should return a lead by ID', async () => {
      const lead = { _id: VALID_ID, name: 'Jane Smith', email: 'jane@example.com' };
      mockLeadRepository.findById.mockResolvedValue(lead);

      expect(await service.getLeadById(VALID_ID)).toBe(lead);
    });

    it('should throw NotFoundError for missing lead', async () => {
      mockLeadRepository.findById.mockResolvedValue(null);
      await expect(service.getLeadById(VALID_ID)).rejects.toThrow('Lead not found');
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status', async () => {
      const lead = { _id: VALID_ID, websiteId: { toString: () => VALID_ID }, status: 'new' };
      mockLeadRepository.findById.mockResolvedValue(lead);
      mockLeadRepository.updateStatus.mockResolvedValue({ ...lead, status: 'qualified' });

      const result = await service.updateLeadStatus(VALID_ID, VALID_ID, 'qualified');
      expect(result.status).toBe('qualified');
    });

    it('should emit LEAD_CONVERTED when status is converted', async () => {
      const lead = { _id: VALID_ID, websiteId: { toString: () => VALID_ID }, status: 'new' };
      mockLeadRepository.findById.mockResolvedValue(lead);
      mockLeadRepository.updateStatus.mockResolvedValue({ ...lead, status: 'converted' });

      await service.updateLeadStatus(VALID_ID, VALID_ID, 'converted');

      const { EventBus } = require('../../src/core/events/EventBus');
      expect(EventBus.emit).toHaveBeenCalled();
    });
  });

  describe('assignLead', () => {
    it('should assign a lead to a user', async () => {
      const lead = { _id: VALID_ID, name: 'Jane Smith' };
      mockLeadRepository.findById.mockResolvedValue(lead);
      mockLeadRepository.assignLead.mockResolvedValue({ ...lead, assignedTo: 'agent-1' });

      const result = await service.assignLead(VALID_ID, VALID_ID, 'agent-1');
      expect(result.assignedTo).toBe('agent-1');
    });
  });
});
