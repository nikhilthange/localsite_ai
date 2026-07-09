import rateLimit from 'express-rate-limit';

export class RateLimiter {
  static global = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },
  });

  static auth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: true,
  });

  static api = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Rate limit exceeded',
    },
  });

  static aiGeneration = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'AI generation limit reached. Please try again later.',
    },
  });

  static async createRedisStore(): Promise<any> {
    const redis = await import('redis');
    const RedisStore = (await import('rate-limit-redis')).default;
    let client: any;
    try {
      client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: () => false,
        },
      });
      await client.connect();
      return new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        prefix: 'rate-limit:',
      });
    } catch {
      if (client) {
        try { await client.quit(); } catch { /* ignore */ }
      }
      console.warn('Redis unavailable for rate limiter store. Using in-memory store.');
      return undefined;
    }
  }
}
