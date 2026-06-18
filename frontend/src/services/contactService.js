import api from '@/lib/axios';

export const contactService = {
  submitContactForm(data) {
    return api.post('/contact/submit', data);
  },

  getLeads(websiteId, params) {
    return api.get(`/contact/leads/${websiteId}`, { params });
  },

  updateLeadStatus(id, status) {
    return api.put(`/contact/leads/${id}/status`, { status });
  },

  getContactForms(websiteId) {
    return api.get(`/contact/forms/${websiteId}`);
  },
};
