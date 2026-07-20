import { EventBus } from '../../src/core/events/EventBus';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.removeAllListeners();
  });

  describe('on / emit', () => {
    it('should register and trigger event listeners', () => {
      const handler = vi.fn();
      EventBus.on('user:registered', handler);
      EventBus.emit('user:registered', { userId: '123' });

      expect(handler).toHaveBeenCalledWith({ userId: '123' });
    });

    it('should support multiple listeners per event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      EventBus.on('payment:completed', handler1);
      EventBus.on('payment:completed', handler2);
      EventBus.emit('payment:completed', { paymentId: 'pay-1' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should pass event data to handlers', () => {
      const handler = vi.fn();
      EventBus.on('website:published', handler);
      const data = { websiteId: 'web-1', url: 'https://test.localsiteai.com' };
      EventBus.emit('website:published', data);

      expect(handler).toHaveBeenCalledWith(data);
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const handler = vi.fn();
      EventBus.on('test:event', handler);
      EventBus.off('test:event', handler);
      EventBus.emit('test:event', {});

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not affect other listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      EventBus.on('test:event', handler1);
      EventBus.on('test:event', handler2);
      EventBus.off('test:event', handler1);
      EventBus.emit('test:event', {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize without error', () => {
      expect(() => EventBus.initialize()).not.toThrow();
    });

    it('should respect max listeners limit', () => {
      for (let i = 0; i < 110; i++) {
        EventBus.on('test:overflow' as any, () => {});
      }
      expect(() => EventBus.emit('test:overflow' as any, {})).not.toThrow();
      EventBus.removeAllListeners('test:overflow' as any);
    });
  });

  describe('event payloads', () => {
    it('should handle async event handlers', async () => {
      const handler = vi.fn().mockResolvedValue('done');
      EventBus.on('async:event', handler);
      EventBus.emit('async:event', { data: 'test' });

      expect(handler).toHaveBeenCalled();
    });

    it('handler errors do not propagate through emit (caught internally)', () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      EventBus.on('error:event', handler);

      expect(() => EventBus.emit('error:event', {})).not.toThrow();
      expect(handler).toHaveBeenCalled();
    });
  });
});
