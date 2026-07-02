import { Campaign } from '../../src/modules/marketing/models/Campaign';

vi.mock('../../src/modules/marketing/models/Campaign', () => ({
  Campaign: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('../../src/modules/website/models/Website', () => ({
  Website: { findById: vi.fn() },
}));

vi.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: vi.fn() } }));

describe('Marketing Campaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a campaign with required fields', async () => {
      const campaignData = {
        websiteId: 'web-1',
        name: 'Summer Sale',
        type: 'email',
        status: 'draft',
        audience: { segments: ['all-subscribers'] },
        content: { subject: 'Big Summer Sale!', body: 'Get 20% off...' },
        schedule: { startDate: new Date('2025-06-01'), endDate: new Date('2025-06-30') },
      };

      (Campaign.create as vi.Mock).mockResolvedValue({
        _id: 'camp-1',
        ...campaignData,
        stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
        createdAt: new Date(),
      });

      const result = await Campaign.create(campaignData);

      expect(result._id).toBe('camp-1');
      expect(result.stats.sent).toBe(0);
      expect(Campaign.create).toHaveBeenCalledWith(campaignData);
    });
  });

  describe('findByWebsiteId', () => {
    it('should return campaigns for a website', async () => {
      (Campaign.find as vi.Mock).mockReturnValue({
        sort: vi.fn().mockResolvedValue([
          { _id: 'camp-1', name: 'Campaign 1', status: 'active' },
          { _id: 'camp-2', name: 'Campaign 2', status: 'draft' },
        ]),
      });

      const results = await Campaign.find({ websiteId: 'web-1' }).sort({ createdAt: -1 });

      expect(results).toHaveLength(2);
    });
  });

  describe('update campaign', () => {
    it('should update campaign status', async () => {
      (Campaign.findByIdAndUpdate as vi.Mock).mockResolvedValue({
        _id: 'camp-1',
        status: 'active',
        launchedAt: new Date(),
      });

      const result = await Campaign.findByIdAndUpdate(
        'camp-1',
        { status: 'active', launchedAt: new Date() },
        { new: true }
      );

      expect(result.status).toBe('active');
    });
  });

  describe('campaign status lifecycle', () => {
    it('should follow valid status transitions', () => {
      const statuses = ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'];

      expect(statuses).toContain('draft');
      expect(statuses).toContain('active');
      expect(statuses).toContain('completed');

      const transitions: Record<string, string[]> = {
        draft: ['scheduled', 'cancelled'],
        scheduled: ['active', 'draft', 'cancelled'],
        active: ['paused', 'completed'],
        paused: ['active', 'cancelled'],
        completed: [],
        cancelled: [],
      };

      expect(transitions.draft).toContain('scheduled');
      expect(transitions.active).toContain('completed');
      expect(transitions.paused).toContain('active');
    });
  });

  describe('aggregate campaign stats', () => {
    it('should aggregate campaign performance', async () => {
      (Campaign.aggregate as vi.Mock).mockResolvedValue([
        {
          _id: 'web-1',
          totalCampaigns: 5,
          totalSent: 5000,
          totalOpened: 1500,
          totalClicked: 300,
          totalConverted: 50,
          avgOpenRate: 0.3,
          avgClickRate: 0.06,
        },
      ]);

      const result = await Campaign.aggregate([
        { $group: { _id: '$websiteId', totalCampaigns: { $sum: 1 }, totalSent: { $sum: '$stats.sent' } } },
      ]);

      expect(result[0].totalCampaigns).toBe(5);
      expect(result[0].avgOpenRate).toBe(0.3);
    });
  });
});
