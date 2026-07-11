import api from '@/lib/axios';

export const websiteService = {
  generateWebsite(data) {
    const payload = {
      businessName: data.businessName || data.name,
      category: data.category,
    };
    if (data.location) payload.location = data.location;
    if (data.description) payload.description = data.description;
    if (data.phone) payload.phone = data.phone;
    if (data.email) payload.email = data.email;
    if (data.theme) payload.theme = data.theme;
    if (data.website) payload.website = data.website;
    return api.post('/websites/generate-complete', payload);
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

  generateComplete(data) {
    const payload = {
      businessName: data.businessName || data.name,
      category: data.category,
    };
    if (data.location) payload.location = data.location;
    if (data.description) payload.description = data.description;
    if (data.phone) payload.phone = data.phone;
    if (data.email) payload.email = data.email;
    if (data.theme) payload.theme = data.theme;
    return api.post('/websites/generate-complete', payload, {
      timeout: 600000, // Match backend AI_TIMEOUT_MS
    });
  },

  regenerateSection(id, sectionType, instructions) {
    return api.post(`/websites/${id}/regenerate`, { sectionType, instructions });
  },

  updateSection(id, sectionId, data) {
    return api.patch(`/websites/${id}/sections`, { sectionId, data });
  },

  reorderSections(id, sectionIds) {
    return api.put(`/websites/${id}/reorder`, { sectionIds });
  },

  getWebsiteAnalytics(id) {
    return api.get(`/websites/${id}/analytics`);
  },
};
