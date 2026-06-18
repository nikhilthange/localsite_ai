import { AnalyticsService } from '../../src/modules/analytics/services/AnalyticsService';

const VALID_ID = '507f1f77bcf86cd799439011';

const mockAnalyticsRepository = {
  trackEvent: jest.fn(),
  getWebsiteAnalytics: jest.fn(),
  getAnalyticsByPage: jest.fn(),
  getTrafficSources: jest.fn(),
  getGeoData: jest.fn(),
  getDeviceStats: jest.fn(),
  getHourlyTraffic: jest.fn(),
  paginate: jest.fn(),
};

jest.mock('../../src/modules/analytics/repositories/AnalyticsRepository', () => ({
  AnalyticsRepository: jest.fn().mockImplementation(() => mockAnalyticsRepository),
}));

const mockWebsiteFindById = jest.fn();
jest.mock('../../src/modules/website/models/Website', () => ({
  Website: { findById: (...args: any[]) => mockWebsiteFindById(...args) },
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebsiteFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    service = new AnalyticsService();
  });

  describe('trackPageView', () => {
    it('should track a page view event', async () => {
      const eventData = {
        websiteId: VALID_ID,
        visitorId: 'visitor-1',
        page: '/',
        device: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        sessionId: 'session-1',
      };
      const createdEvent = { _id: 'event-1', ...eventData, timestamp: new Date() };
      mockAnalyticsRepository.trackEvent.mockResolvedValue(createdEvent);

      const result = await service.trackPageView(eventData as any);

      expect(result).toBe(createdEvent);
    });
  });

  describe('getWebsiteStats', () => {
    it('should return aggregated website stats', async () => {
      mockWebsiteFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });
      mockAnalyticsRepository.getWebsiteAnalytics.mockResolvedValue([{
        totalVisitors: ['v1', 'v2', 'v3'], totalPageViews: 150, avgDuration: 45.5, bounceRate: 0.35,
      }]);
      mockAnalyticsRepository.getAnalyticsByPage.mockResolvedValue([
        { page: '/', views: 100, uniqueVisitors: ['v1', 'v2'] },
      ]);
      mockAnalyticsRepository.getTrafficSources.mockResolvedValue([
        { source: 'google', count: 80, uniqueVisitors: ['v1'] },
      ]);
      mockAnalyticsRepository.getGeoData.mockResolvedValue([{ country: 'US', city: 'NYC', count: 100 }]);
      mockAnalyticsRepository.getDeviceStats.mockResolvedValue([{ device: 'mobile', count: 90 }]);
      mockAnalyticsRepository.getHourlyTraffic.mockResolvedValue([{ hour: 10, views: 30, visitors: ['v1'] }]);

      const result = await service.getWebsiteStats(VALID_ID, { start: new Date('2024-01-01'), end: new Date('2024-01-31') });

      expect(result.overview.totalVisitors).toBe(3);
      expect(result.overview.totalPageViews).toBe(150);
      expect(result.sources).toHaveLength(1);
    });

    it('should throw if website not found', async () => {
      mockWebsiteFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(
        service.getWebsiteStats(VALID_ID, { start: new Date(), end: new Date() })
      ).rejects.toThrow('Website not found');
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard stats with 30d period', async () => {
      mockWebsiteFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });
      mockAnalyticsRepository.getWebsiteAnalytics.mockResolvedValue([{}]);
      mockAnalyticsRepository.getAnalyticsByPage.mockResolvedValue([]);
      mockAnalyticsRepository.getTrafficSources.mockResolvedValue([]);
      mockAnalyticsRepository.getGeoData.mockResolvedValue([]);
      mockAnalyticsRepository.getDeviceStats.mockResolvedValue([]);
      mockAnalyticsRepository.getHourlyTraffic.mockResolvedValue([]);

      const result = await service.getDashboardData(VALID_ID, '30d');

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
    });
  });
});
