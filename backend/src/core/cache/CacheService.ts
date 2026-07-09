import { createClient, RedisClientType } from 'redis';
import { connect } from 'net';

export type RedisClient = RedisClientType;

function redisIsAvailable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const port = parseInt(parsed.port || '6379', 10);
      const host = parsed.hostname || 'localhost';
      const socket = connect(port, host, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.setTimeout(2000, () => {
        socket.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

export class CacheService {
  private static client: RedisClient | null = null;
  private static readonly DEFAULT_TTL = 300;
  private static _isConnected = false;

  static async initialize(url: string): Promise<void> {
    const available = await redisIsAvailable(url);
    if (!available) {
      console.warn('✗ Redis is not running. The application will continue without caching.');
      console.warn('  → Start Redis: docker compose up -d redis');
      return;
    }

    try {
      this.client = createClient({
        url,
        socket: {
          reconnectStrategy: () => false,
          connectTimeout: 5000,
        },
      });

      this.client.on('error', () => {});

      this.client.on('connect', () => {
        this._isConnected = true;
      });

      this.client.on('ready', () => {
        this._isConnected = true;
      });

      this.client.on('end', () => {
        this._isConnected = false;
      });

      await this.client.connect();
      this._isConnected = true;
      console.log('✓ Redis Connected');
    } catch (error: any) {
      this._isConnected = false;
      this.client = null;
      console.warn('✗ Redis connection failed: ' + error.message + '. Continuing without cache.');
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this._isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    if (!this.client || !this._isConnected) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
    } catch {
      // ignore
    }
  }

  static async del(key: string): Promise<void> {
    if (!this.client || !this._isConnected) return;
    try {
      await this.client.del(key);
    } catch {
      // ignore
    }
  }

  static async delByPattern(pattern: string): Promise<void> {
    if (!this.client || !this._isConnected) return;
    try {
      let cursor = '0';
      do {
        const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await this.client.del(result.keys);
        }
      } while (cursor !== '0');
    } catch {
      // ignore
    }
  }

  static async exists(key: string): Promise<boolean> {
    if (!this.client || !this._isConnected) return false;
    try {
      const count = await this.client.exists(key);
      return count > 0;
    } catch {
      return false;
    }
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
    if (!this.client || !this._isConnected) return 0;
    try {
      return this.client.incrBy(key, amount);
    } catch {
      return 0;
    }
  }

  static async expire(key: string, ttl: number): Promise<void> {
    if (!this.client || !this._isConnected) return;
    try {
      await this.client.expire(key, ttl);
    } catch {
      // ignore
    }
  }

  static async flushAll(): Promise<void> {
    if (!this.client || !this._isConnected) return;
    try {
      await this.client.flushAll();
    } catch {
      // ignore
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      try { await this.client.quit(); } catch { /* ignore */ }
      this.client = null;
      this._isConnected = false;
    }
  }

  static get isConnected(): boolean {
    return this._isConnected && (this.client?.isOpen ?? false);
  }
}
