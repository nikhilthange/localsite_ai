import { CacheService } from '../../src/core/cache/CacheService';
import { connect } from 'net';

vi.mock('net', () => ({
  connect: vi.fn().mockImplementation((port, host, cb) => {
    if (cb) setTimeout(cb, 10);
    return {
      destroy: vi.fn(),
      on: vi.fn(),
      setTimeout: vi.fn(),
    };
  }),
}));

const mockRedisMethods = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  set: vi.fn(),
  setEx: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  keys: vi.fn(),
  flushAll: vi.fn(),
  on: vi.fn(),
  isOpen: true,
  quit: vi.fn(),
};

vi.mock('redis', () => ({
  createClient: vi.fn(() => mockRedisMethods),
}));

describe('CacheService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await CacheService.initialize('redis://localhost:6379');
  });

  afterEach(async () => {
    await CacheService.disconnect();
  });

  describe('get', () => {
    it('should return null for missing key', async () => {
      mockRedisMethods.get.mockResolvedValue(null);

      const result = await CacheService.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return parsed value for existing key', async () => {
      mockRedisMethods.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      const result = await CacheService.get('existing-key');
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('set', () => {
    it('should set a value with default TTL', async () => {
      await CacheService.set('test-key', { value: 42 });

      expect(mockRedisMethods.setEx).toHaveBeenCalledWith(
        'test-key',
        expect.any(Number),
        JSON.stringify({ value: 42 })
      );
    });

    it('should set a value with custom TTL', async () => {
      await CacheService.set('temporal', 'data', 60);

      expect(mockRedisMethods.setEx).toHaveBeenCalledWith('temporal', 60, expect.any(String));
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      await CacheService.del('test-key');

      expect(mockRedisMethods.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      mockRedisMethods.exists.mockResolvedValue(true);

      const result = await CacheService.exists('test-key');

      expect(result).toBe(true);
    });
  });

  describe('remember (cache-aside) pattern', () => {
    it('should fetch from store and cache the result', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ fromDb: true });
      mockRedisMethods.get.mockResolvedValue(null);

      const result = await CacheService.remember('user-1', 300, fetchFn);

      expect(result).toEqual({ fromDb: true });
      expect(fetchFn).toHaveBeenCalled();
      expect(mockRedisMethods.setEx).toHaveBeenCalledWith('user-1', 300, JSON.stringify({ fromDb: true }));
    });

    it('should return cached value without calling factory', async () => {
      const fetchFn = vi.fn();
      mockRedisMethods.get.mockResolvedValue(JSON.stringify({ cached: true }));

      const result = await CacheService.remember('cached-key', 300, fetchFn);

      expect(result).toEqual({ cached: true });
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe('health', () => {
    it('should report connection status', () => {
      expect(CacheService.isConnected).toBeDefined();
    });
  });
});
