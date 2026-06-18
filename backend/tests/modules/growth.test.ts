import { GrowthService } from '../../src/modules/growth/services/GrowthService';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/growth/repositories/GrowthRepository', () => {
  const mock = {
    getLatestReport: jest.fn(),
    getReportsByWebsite: jest.fn(),
    getReportById: jest.fn(),
    getWeeklyTrends: jest.fn(),
    getInsights: jest.fn(),
    getUnreadInsightCount: jest.fn(),
    markInsightRead: jest.fn(),
    markInsightDismissed: jest.fn(),
  };
  (global as any).__mockGrowthRepo = mock;
  return { GrowthRepository: jest.fn().mockImplementation(() => mock) };
});

jest.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: jest.fn() } }));

const mockLean = (val: any) => ({
  lean: jest.fn().mockResolvedValue(val),
});

jest.mock('../../src/modules/website/models/Website', () => ({
  Website: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/modules/growth/models/BusinessInsight', () => ({
  BusinessInsight: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/modules/growth/models/WeeklyReport', () => ({
  WeeklyReport: { create: jest.fn() },
}));

jest.mock('../../src/modules/analytics/models/Analytics', () => ({
  Analytics: { aggregate: jest.fn(), countDocuments: jest.fn() },
}));

jest.mock('../../src/modules/lead/models/Lead', () => ({
  Lead: { find: jest.fn(), countDocuments: jest.fn() },
}));

const mockRepo = (global as any).__mockGrowthRepo;

describe('GrowthService', () => {
  let service: GrowthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GrowthService();
  });

  describe('getDashboard', () => {
    it('should return aggregated dashboard', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.find as jest.Mock).mockReturnValue(mockLean([
        { _id: VALID_ID, name: 'Site 1', userId: VALID_ID },
      ]));
      mockRepo.getLatestReport.mockResolvedValue({
        _id: 'r-1', scores: { businessHealth: 78, seo: 65, leads: 70, conversion: 80, satisfaction: 75 },
      });
      mockRepo.getUnreadInsightCount.mockResolvedValue(3);
      mockRepo.getWeeklyTrends.mockResolvedValue([]);

      const result = await service.getDashboard(VALID_ID);

      expect(result.websites).toHaveLength(1);
      expect(result.websites[0].website.name).toBe('Site 1');
      expect(result.unreadInsights).toBe(3);
    });
  });

  describe('getWebsiteDashboard', () => {
    it('should return website-specific dashboard', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean({
        _id: VALID_ID, name: 'Site 1', userId: VALID_ID,
      }));
      mockRepo.getLatestReport.mockResolvedValue({
        _id: 'r-1', scores: { businessHealth: 80, seo: 70, leads: 75, conversion: 85, satisfaction: 90 },
      });
      mockRepo.getWeeklyTrends.mockResolvedValue([]);
      mockRepo.getUnreadInsightCount.mockResolvedValue(2);

      const result = await service.getWebsiteDashboard(VALID_ID, VALID_ID);

      expect(result.website.name).toBe('Site 1');
      expect(result.latestReport.scores.businessHealth).toBe(80);
      expect(result.unreadInsights).toBe(2);
    });

    it('should throw if website not found', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean(null));

      await expect(service.getWebsiteDashboard(VALID_ID, 'other-user')).rejects.toThrow('Website not found');
    });
  });

  describe('getReports', () => {
    it('should return paginated reports for owned website', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean({ _id: VALID_ID, userId: VALID_ID }));

      const reports = {
        data: [{ _id: 'r-1', scores: { businessHealth: 75 } }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepo.getReportsByWebsite.mockResolvedValue(reports);

      const result = await service.getReports(VALID_ID, VALID_ID, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
    });

    it('should throw if website not owned', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean(null));

      await expect(service.getReports(VALID_ID, 'other-user', { page: 1, limit: 10 })).rejects.toThrow('Website not found');
    });
  });

  describe('getReportDetail', () => {
    it('should return report detail for authorized user', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean({ _id: VALID_ID, userId: VALID_ID }));

      const report = { _id: 'r-1', websiteId: VALID_ID, scores: { businessHealth: 82 } };
      mockRepo.getReportById.mockResolvedValue(report);

      const result = await service.getReportDetail('r-1', VALID_ID);

      expect(result._id).toBe('r-1');
    });

    it('should throw if not found', async () => {
      mockRepo.getReportById.mockResolvedValue(null);

      await expect(service.getReportDetail('nonexistent', VALID_ID)).rejects.toThrow('Report not found');
    });

    it('should throw if unauthorized', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean(null));

      mockRepo.getReportById.mockResolvedValue({ _id: 'r-1', websiteId: VALID_ID });

      await expect(service.getReportDetail('r-1', 'other-user')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getTrends', () => {
    it('should return trend data for owned website', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean({ _id: VALID_ID, userId: VALID_ID }));

      mockRepo.getWeeklyTrends.mockResolvedValue([
        { weekStart: new Date('2024-01-01'), scores: { businessHealth: 70, seo: 65, leads: 60, conversion: 75, satisfaction: 80 } },
        { weekStart: new Date('2024-01-08'), scores: { businessHealth: 75, seo: 68, leads: 65, conversion: 78, satisfaction: 82 } },
      ]);

      const result = await service.getTrends(VALID_ID, VALID_ID, 4);

      expect(result.labels).toHaveLength(2);
      expect(result.businessHealth).toEqual([75, 70]);
    });

    it('should throw if website not owned', async () => {
      const { Website } = require('../../src/modules/website/models/Website');
      (Website.findOne as jest.Mock).mockReturnValue(mockLean(null));

      await expect(service.getTrends(VALID_ID, 'other-user')).rejects.toThrow('Website not found');
    });
  });

  describe('getInsights', () => {
    it('should return insights for user', async () => {
      const insights = {
        data: [{ _id: 'i-1', title: 'Add blog section', severity: 'high', read: false }],
        pagination: { page: 1, limit: 20, total: 1 },
      };
      mockRepo.getInsights.mockResolvedValue(insights);

      const result = await service.getInsights(VALID_ID, VALID_ID);

      expect(result).toBe(insights);
    });
  });

  describe('markInsightRead', () => {
    it('should mark insight as read for owner', async () => {
      const { BusinessInsight } = require('../../src/modules/growth/models/BusinessInsight');
      (BusinessInsight.findOne as jest.Mock).mockReturnValue(mockLean({ _id: 'i-1', userId: VALID_ID }));

      mockRepo.markInsightRead.mockResolvedValue({ _id: 'i-1', read: true });

      await service.markInsightRead('i-1', VALID_ID);

      expect(mockRepo.markInsightRead).toHaveBeenCalledWith('i-1');
    });

    it('should throw if insight not found', async () => {
      const { BusinessInsight } = require('../../src/modules/growth/models/BusinessInsight');
      (BusinessInsight.findOne as jest.Mock).mockReturnValue(mockLean(null));

      await expect(service.markInsightRead('nonexistent', VALID_ID)).rejects.toThrow('Insight not found');
    });
  });

  describe('markInsightDismissed', () => {
    it('should mark insight as dismissed', async () => {
      const { BusinessInsight } = require('../../src/modules/growth/models/BusinessInsight');
      (BusinessInsight.findOne as jest.Mock).mockReturnValue(mockLean({ _id: 'i-1', userId: VALID_ID }));

      mockRepo.markInsightDismissed.mockResolvedValue({ _id: 'i-1', dismissed: true });

      await service.markInsightDismissed('i-1', VALID_ID);

      expect(mockRepo.markInsightDismissed).toHaveBeenCalledWith('i-1');
    });
  });
});
