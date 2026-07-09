import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let csrfToken = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchCsrfToken() {
  try {
    const { data } = await api.get('/csrf-token');
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch {
    // Server may have CSRF disabled in dev
  }
}

export function getCsrfToken() {
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    if (!csrfToken) await fetchCsrfToken();
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
