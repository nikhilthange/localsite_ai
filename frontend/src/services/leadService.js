import api from '@/lib/axios';

export const leadService = {
  getLeads(params) {
    return api.get('/leads', { params });
  },

  getLead(id) {
    return api.get(`/leads/${id}`);
  },

  createLead(data) {
    return api.post('/leads', data);
  },

  updateLead(id, data) {
    return api.put(`/leads/${id}`, data);
  },

  deleteLead(id) {
    return api.delete(`/leads/${id}`);
  },

  updateLeadStatus(id, status) {
    return api.patch(`/leads/${id}/status`, { status });
  },

  assignLead(id, userId) {
    return api.patch(`/leads/${id}/assign`, { userId });
  },

  addNote(id, content) {
    return api.post(`/leads/${id}/notes`, { content });
  },

  bulkUpdateStatus(ids, status) {
    return api.post('/leads/bulk/status', { ids, status });
  },

  exportLeads(params) {
    return api.get('/leads/export', {
      params,
      responseType: 'blob',
    });
  },
};
