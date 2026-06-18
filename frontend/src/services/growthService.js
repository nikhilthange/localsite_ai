import api from '@/lib/axios';

export const growthService = {
  getDashboard() {
    return api.get('/growth/dashboard');
  },

  getReports(params) {
    return api.get('/growth/reports', { params });
  },

  getReport(id) {
    return api.get(`/growth/reports/${id}`);
  },

  generateReport(websiteId) {
    return api.post('/growth/reports/generate', { websiteId });
  },

  getInsights() {
    return api.get('/growth/insights');
  },

  markInsightRead(id) {
    return api.put(`/growth/insights/${id}/read`);
  },

  dismissInsight(id) {
    return api.put(`/growth/insights/${id}/dismiss`);
  },

  getTrends(weeks = 8) {
    return api.get('/growth/trends', { params: { weeks } });
  },

  getWebsiteAnalysis(websiteId) {
    return api.get(`/growth/analysis/${websiteId}`);
  },
};
