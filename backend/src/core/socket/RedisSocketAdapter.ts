import { createClient } from 'redis';
import { connect } from 'net';
import config from '../../config';

function redisIsAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(config.redis.url);
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

export class RedisSocketAdapter {
  private static publisher: ReturnType<typeof createClient>;
  private static subscriber: ReturnType<typeof createClient>;
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    const available = await redisIsAvailable();
    if (!available) {
      throw new Error('Redis unavailable for Socket.IO adapter');
    }

    try {
      this.publisher = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: () => false,
          connectTimeout: 3000,
        },
      });
      this.subscriber = this.publisher.duplicate();

      this.publisher.on('error', () => {});
      this.subscriber.on('error', () => {});

      await Promise.all([this.publisher.connect(), this.subscriber.connect()]);
      this.initialized = true;
    } catch {
      this.initialized = false;
      throw new Error('Redis unavailable for Socket.IO adapter');
    }
  }

  static getPublisher() {
    return this.publisher;
  }

  static getSubscriber() {
    return this.subscriber;
  }

  static async publish(channel: string, message: string): Promise<void> {
    if (!this.initialized) return;
    try {
      await this.publisher.publish(channel, message);
    } catch {
      // Silently fail if Redis is down
    }
  }

  static async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.initialized) return;
    try {
      await this.subscriber.subscribe(channel, callback);
    } catch {
      // Silently fail if Redis is down
    }
  }

  static async disconnect(): Promise<void> {
    if (this.initialized) {
      try {
        await this.publisher.quit();
        await this.subscriber.quit();
      } catch {
        // Ignore errors during disconnect
      }
      this.initialized = false;
    }
  }
}
