import request from 'supertest';
import app from '../../src/app';

describe('Health Check API', () => {
  it('GET /api/health returns 200 with server info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/health returns application/json', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
