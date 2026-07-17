// ============================================
// LocalSite AI - Auth Stress Test (k6)
// Focuses on authentication endpoint resilience
// ============================================
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://api.localsiteai.com';

const authErrorRate = new Rate('auth_errors');
const authLatency = new Trend('auth_latency');

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    auth_latency: ['p(95)<3000'],
    auth_errors: ['rate<0.10'],
    http_req_duration: ['p(95)<5000'],
  },
};

const testUsers = Array.from({ length: 50 }, (_, i) => ({
  email: `stress-user-${i}@test.com`,
  password: 'StressTestP@ss123',
}));

export default function () {
  group('Registration', () => {
    const vu = __VU;
    const payload = JSON.stringify({
      name: `Stress User ${vu}`,
      email: `stress-${vu}-${Date.now()}@test.com`,
      password: 'StressTestP@ss123',
    });

    const res = http.post(`${BASE_URL}/api/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { auth_type: 'register' },
    });

    const passed = check(res, {
      'register handled': (r) => r.status < 500,
      'register response time OK': (r) => r.timings.duration < 4000,
    });

    authLatency.add(res.timings.duration);
    authErrorRate.add(!passed);
    sleep(1);
  });

  group('Login', () => {
    const user = testUsers[__VU % testUsers.length];
    const payload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { auth_type: 'login' },
    });

    const passed = check(res, {
      'login returns 200 or 401': (r) => r.status === 200 || r.status === 401,
    });

    authLatency.add(res.timings.duration);
    authErrorRate.add(!passed);

    if (res.status === 200) {
      const token = res.json().data?.token || res.json().token;

      group('Authenticated Requests', () => {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Profile fetch
        const profileRes = http.get(`${BASE_URL}/api/auth/profile`, {
          headers: authHeaders,
        });
        check(profileRes, { 'profile fetched': (r) => r.status < 500 });

        // Session validation
        const meRes = http.get(`${BASE_URL}/api/auth/me`, {
          headers: authHeaders,
        });
        check(meRes, { 'session valid': (r) => r.status === 200 || r.status === 401 });
      });
    }

    sleep(2);
  });

  group('Password Reset Flow', () => {
    const res = http.post(
      `${BASE_URL}/api/auth/forgot-password`,
      JSON.stringify({ email: `stress-${__VU}@test.com` }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, {
      'forgot password handled': (r) => r.status < 500,
    });

    sleep(1);
  });
}
