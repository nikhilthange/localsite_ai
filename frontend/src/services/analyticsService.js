import api from '@/lib/axios';

export const analyticsService = {
  getWebsiteAnalytics(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}`, { params });
  },

  getOverview(params) {
    return api.get('/analytics/overview', { params });
  },

  getRealtime(websiteId) {
    return api.get(`/analytics/websites/${websiteId}/realtime`);
  },

  getEvents(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/events`, { params });
  },

  getPageViews(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/pageviews`, { params });
  },

  getVisitors(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/visitors`, { params });
  },

  getSources(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/sources`, { params });
  },

  getLocations(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/locations`, { params });
  },

  getDevices(websiteId, params) {
    return api.get(`/analytics/websites/${websiteId}/devices`, { params });
  },

  exportReport(websiteId, format = 'csv', params) {
    return api.get(`/analytics/websites/${websiteId}/export`, {
      params: { format, ...params },
      responseType: 'blob',
    });
  },
};
