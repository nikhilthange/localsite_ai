import { EventEmitter } from 'events';
import { SystemEvents, EventCallback } from '../../types/events';
import { Logger } from '../logging/Logger';

export class EventBus {
  private static emitter = new EventEmitter();
  private static readonly MAX_LISTENERS = 100;
  private static readonly wrappedMap = new WeakMap<EventCallback<any>, EventCallback<any>>();

  static initialize(): void {
    this.emitter.setMaxListeners(this.MAX_LISTENERS);
  }

  static emit<T>(event: SystemEvents, payload: T): boolean {
    return this.emitter.emit(event, payload);
  }

  static on<T>(event: SystemEvents, callback: EventCallback<T>): void {
    const wrapped = (payload: T) => {
      try {
        const result = callback(payload);
        if (result instanceof Promise) {
          result.catch((err) => Logger.error('Unhandled rejection in event handler', {
            event,
            error: (err as Error).message,
          }));
        }
      } catch (err) {
        Logger.error('Error in event handler', {
          event,
          error: (err as Error).message,
        });
      }
    };
    this.wrappedMap.set(callback, wrapped);
    this.emitter.on(event, wrapped as any);
  }

  static once<T>(event: SystemEvents, callback: EventCallback<T>): void {
    const wrapped = (payload: T) => {
      try {
        const result = callback(payload);
        if (result instanceof Promise) {
          result.catch((err) => Logger.error('Unhandled rejection in once handler', {
            event,
            error: (err as Error).message,
          }));
        }
      } catch (err) {
        Logger.error('Error in once handler', {
          event,
          error: (err as Error).message,
        });
      }
    };
    this.wrappedMap.set(callback, wrapped);
    this.emitter.once(event, wrapped as any);
  }

  static off<T>(event: SystemEvents, callback: EventCallback<T>): void {
    const wrapped = this.wrappedMap.get(callback);
    if (wrapped) {
      this.emitter.off(event, wrapped as any);
      this.wrappedMap.delete(callback);
    }
  }

  static removeAllListeners(event?: SystemEvents): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  static listenerCount(event: SystemEvents): number {
    return this.emitter.listenerCount(event);
  }
}
