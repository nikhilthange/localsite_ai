import { createClient } from 'redis';
import config from '../../config';

export class RedisSocketAdapter {
  private static publisher: ReturnType<typeof createClient>;
  private static subscriber: ReturnType<typeof createClient>;
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    this.publisher = createClient({ url: config.redis.url });
    this.subscriber = this.publisher.duplicate();

    await Promise.all([this.publisher.connect(), this.subscriber.connect()]);
    this.initialized = true;
  }

  static getPublisher() {
    return this.publisher;
  }

  static getSubscriber() {
    return this.subscriber;
  }

  static async publish(channel: string, message: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    await this.publisher.publish(channel, message);
  }

  static async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.initialized) await this.initialize();
    await this.subscriber.subscribe(channel, callback);
  }

  static async disconnect(): Promise<void> {
    if (this.initialized) {
      await this.publisher.quit();
      await this.subscriber.quit();
      this.initialized = false;
    }
  }
}
