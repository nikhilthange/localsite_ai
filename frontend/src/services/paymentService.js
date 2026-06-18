import api from '@/lib/axios';

export const paymentService = {
  createOrder(data) {
    return api.post('/payments/create-order', data);
  },

  verifyPayment(data) {
    return api.post('/payments/verify', data);
  },

  getPlans() {
    return api.get('/payments/plans');
  },

  createSubscription(data) {
    return api.post('/payments/subscriptions', data);
  },

  cancelSubscription(id) {
    return api.post(`/payments/subscriptions/${id}/cancel`);
  },

  getInvoices(params) {
    return api.get('/payments/invoices', { params });
  },
};
