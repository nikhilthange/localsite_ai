import api from '@/lib/axios';

export const websiteService = {
  generateWebsite(data) {
    return api.post('/websites/generate', data);
  },

  getWebsites(params) {
    return api.get('/websites', { params });
  },

  getWebsite(id) {
    return api.get(`/websites/${id}`);
  },

  updateWebsite(id, data) {
    return api.put(`/websites/${id}`, data);
  },

  deleteWebsite(id) {
    return api.delete(`/websites/${id}`);
  },

  publishWebsite(id) {
    return api.post(`/websites/${id}/publish`);
  },

  regenerateSection(id, sectionType, instructions) {
    return api.post(`/websites/${id}/regenerate`, { sectionType, instructions });
  },

  getWebsiteAnalytics(id) {
    return api.get(`/websites/${id}/analytics`);
  },
};
