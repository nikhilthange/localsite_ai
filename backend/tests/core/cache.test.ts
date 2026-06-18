import { CacheService } from '../../src/core/cache/CacheService';

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn(),
    flushAll: jest.fn(),
    on: jest.fn(),
    isOpen: true,
    quit: jest.fn(),
  }),
}));

describe('CacheService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await CacheService.initialize('redis://localhost:6379');
  });

  afterEach(async () => {
    await CacheService.disconnect();
  });

  describe('get', () => {
    it('should return null for missing key', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();
      (mockClient.get as jest.Mock).mockResolvedValue(null);

      const result = await CacheService.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return parsed value for existing key', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();
      (mockClient.get as jest.Mock).mockResolvedValue(JSON.stringify({ data: 'test' }));

      const result = await CacheService.get('existing-key');
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('set', () => {
    it('should set a value with default TTL', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();

      await CacheService.set('test-key', { value: 42 });

      expect(mockClient.setEx).toHaveBeenCalledWith(
        'test-key',
        expect.any(Number),
        JSON.stringify({ value: 42 })
      );
    });

    it('should set a value with custom TTL', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();

      await CacheService.set('temporal', 'data', 60);

      expect(mockClient.setEx).toHaveBeenCalledWith('temporal', 60, expect.any(String));
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();

      await CacheService.del('test-key');

      expect(mockClient.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();
      (mockClient.exists as jest.Mock).mockResolvedValue(true);

      const result = await CacheService.exists('test-key');

      expect(result).toBe(true);
    });
  });

  describe('remember (cache-aside) pattern', () => {
    it('should fetch from store and cache the result', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();
      const fetchFn = jest.fn().mockResolvedValue({ fromDb: true });

      (mockClient.get as jest.Mock).mockResolvedValue(null);

      const result = await CacheService.remember('user-1', 300, fetchFn);

      expect(result).toEqual({ fromDb: true });
      expect(fetchFn).toHaveBeenCalled();
      expect(mockClient.setEx).toHaveBeenCalledWith('user-1', 300, JSON.stringify({ fromDb: true }));
    });

    it('should return cached value without calling factory', async () => {
      const redis = require('redis');
      const mockClient = redis.createClient();
      const fetchFn = jest.fn();

      (mockClient.get as jest.Mock).mockResolvedValue(JSON.stringify({ cached: true }));

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
