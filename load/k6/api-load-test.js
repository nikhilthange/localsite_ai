// ============================================
// LocalSite AI - API Load Test (k6)
// Simulates realistic user traffic patterns
// ============================================
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://api.localsiteai.com';

const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const successCount = new Counter('successful_requests');
const failureCount = new Counter('failed_requests');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Scale to 100 users
    { duration: '2m', target: 200 },  // Peak load 200 users
    { duration: '5m', target: 200 },  // Sustained peak
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s
    http_req_failed: ['rate<0.05'],     // <5% failure rate
    errors: ['rate<0.05'],
  },
};

function getAuthToken() {
  const payload = JSON.stringify({
    email: `loadtest-${Date.now()}@example.com`,
    password: 'LoadTestP@ss123',
  });

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 200) {
    return res.json().data?.token || res.json().token;
  }
  return null;
}

export default function () {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    const passed = check(res, {
      'health status is 200': (r) => r.status === 200,
      'response is JSON': (r) => r.headers['Content-Type']?.includes('json'),
    });
    apiLatency.add(res.timings.duration);
    passed ? successCount.add(1) : failureCount.add(1);
    errorRate.add(!passed);
    sleep(1);
  });

  group('Auth Endpoints', () => {
    // Login attempt
    const loginPayload = JSON.stringify({
      email: `user-${__VU}@example.com`,
      password: 'TestP@ss123',
    });

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'auth-login' },
    });

    const loginPassed = check(loginRes, {
      'login returns 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
    apiLatency.add(loginRes.timings.duration);
    loginPassed ? successCount.add(1) : failureCount.add(1);
    errorRate.add(!loginPassed);

    // Forgot password
    const forgotRes = http.post(
      `${BASE_URL}/api/auth/forgot-password`,
      JSON.stringify({ email: 'test@example.com' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(forgotRes, { 'forgot password handled': (r) => r.status < 500 });

    sleep(2);
  });

  group('Website Endpoints', () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    };

    if (headers.Authorization) {
      // Get websites
      const getRes = http.get(`${BASE_URL}/api/websites?page=1&limit=10`, {
        headers,
        tags: { endpoint: 'websites-list' },
      });
      const getPassed = check(getRes, {
        'websites list status < 500': (r) => r.status < 500,
      });
      apiLatency.add(getRes.timings.duration);
      getPassed ? successCount.add(1) : failureCount.add(1);
      errorRate.add(!getPassed);

      // Generate website (heavy operation)
      const genPayload = JSON.stringify({
        businessName: `Load Test Biz ${__VU}`,
        category: 'restaurant',
        location: 'New York, NY',
      });

      const genRes = http.post(`${BASE_URL}/api/websites/generate`, genPayload, {
        headers,
        tags: { endpoint: 'websites-generate' },
      });
      check(genRes, { 'generate handled': (r) => r.status < 500 });
      apiLatency.add(genRes.timings.duration);
    }

    sleep(3);
  });

  group('Payment Endpoints', () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    };

    if (headers.Authorization) {
      const plansRes = http.get(`${BASE_URL}/api/payments/plans`, {
        headers,
        tags: { endpoint: 'payment-plans' },
      });
      check(plansRes, { 'plans returned': (r) => r.status === 200 });
      apiLatency.add(plansRes.timings.duration);
    }

    sleep(2);
  });
}
