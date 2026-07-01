import { createClient, RedisClientType } from 'redis';

export type RedisClient = RedisClientType;

export class CacheService {
  private static client: RedisClient | null = null;
  private static readonly DEFAULT_TTL = 300;

  static async initialize(url: string): Promise<void> {
    this.client = createClient({ url });

    this.client.on('error', (err: any) => {
      console.error('Redis Cache Error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('Redis Cache connected');
    });

    await this.client.connect();
  }

  static async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    if (!this.client) return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.setEx(key, ttl, serialized);
  }

  static async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  static async delByPattern(pattern: string): Promise<void> {
    if (!this.client) return;
    let cursor = '0';
    do {
      const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await this.client.del(result.keys);
      }
    } while (cursor !== '0');
  }

  static async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    const count = await this.client.exists(key);
    return count > 0;
  }

  static async remember<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await factory();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.client) return 0;
    return this.client.incrBy(key, amount);
  }

  static async expire(key: string, ttl: number): Promise<void> {
    if (!this.client) return;
    await this.client.expire(key, ttl);
  }

  static async flushAll(): Promise<void> {
    if (!this.client) return;
    await this.client.flushAll();
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  static get isConnected(): boolean {
    return this.client?.isOpen ?? false;
  }
}
