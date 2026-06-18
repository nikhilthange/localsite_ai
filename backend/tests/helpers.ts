import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from '../src/config';
import { AuthPayload } from '../src/types/express';

export function generateTestToken(overrides: Partial<AuthPayload> = {}): string {
  const payload: AuthPayload = {
    userId: overrides.userId || new Types.ObjectId().toString(),
    role: overrides.role || 'user',
    email: overrides.email || 'test@example.com',
    sessionId: overrides.sessionId || 'test-session-id',
  };
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '15m' });
}

export function generateAdminToken(): string {
  return generateTestToken({ role: 'admin', email: 'admin@example.com' });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: '7d' });
}

export function createTestUserData(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    name: 'Test User',
    email: 'test-' + Date.now() + '@example.com',
    password: 'TestP@ss123',
    ...overrides,
  };
}

export function createTestWebsiteData(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    businessName: 'Test Business',
    category: 'restaurant',
    location: 'New York, NY',
    phone: '+1 212-555-0100',
    email: 'test@business.com',
    ...overrides,
  };
}

export function createTestLeadData(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    name: 'Jane Lead',
    email: 'jane-' + Date.now() + '@example.com',
    message: 'Interested in your services',
    source: 'contact_form',
    ...overrides,
  };
}

export function createTestAnalyticsEvent(websiteId: string, overrides: Record<string, any> = {}): Record<string, any> {
  return {
    websiteId,
    visitorId: 'visitor-' + Date.now(),
    page: '/',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    sessionId: 'session-' + Date.now(),
    duration: 120,
    bounce: false,
    ...overrides,
  };
}
