import type { ConnectionOptions } from 'bullmq';

export const redisConfig: ConnectionOptions & { retryStrategy?: (times: number) => number; maxRetries?: number } = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetries: 10,
};

export const cacheConfig = {
  defaultTTL: 300,
  longTTL: 3600,
  shortTTL: 60,
  prefixes: {
    user: 'user:',
    website: 'website:',
    session: 'session:',
    analytics: 'analytics:',
    growth: 'growth:',
  },
};
