import api from '@/lib/axios';

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  register(name, email, password) {
    return api.post('/auth/register', { name, email, password });
  },

  logout() {
    return api.post('/auth/logout');
  },

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword(token, password) {
    return api.post('/auth/reset-password', { token, password });
  },

  verifyEmail(token) {
    return api.post('/auth/verify-email', { token });
  },

  googleAuth(idToken) {
    return api.post('/auth/google', { idToken });
  },

  getProfile() {
    return api.get('/auth/profile');
  },

  updateProfile(data) {
    return api.put('/auth/profile', data);
  },

  updatePassword(data) {
    return api.put('/auth/password', data);
  },
};
