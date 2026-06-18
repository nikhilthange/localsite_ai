import api from '@/lib/axios';

export const adminService = {
  getDashboard() {
    return api.get('/admin/dashboard');
  },

  getUsers(params) {
    return api.get('/admin/users', { params });
  },

  getUserDetail(id) {
    return api.get(`/admin/users/${id}`);
  },

  updateUserRole(id, role) {
    return api.put(`/admin/users/${id}/role`, { role });
  },

  getRevenue(params) {
    return api.get('/admin/revenue', { params });
  },

  getSubscriptions(params) {
    return api.get('/admin/subscriptions', { params });
  },

  getTemplates() {
    return api.get('/admin/templates');
  },

  createTemplate(data) {
    return api.post('/admin/templates', data);
  },

  updateTemplate(id, data) {
    return api.put(`/admin/templates/${id}`, data);
  },

  deleteTemplate(id) {
    return api.delete(`/admin/templates/${id}`);
  },
};
