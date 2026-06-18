import { Logger } from '../../src/core/logging/Logger';

describe('Logger', () => {
  beforeAll(() => {
    Logger.initialize();
  });

  describe('log levels', () => {
    it('should log info messages', () => {
      expect(() => Logger.info('Test info message')).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => Logger.warn('Test warning')).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => Logger.error('Test error')).not.toThrow();
    });

    it('should log debug messages', () => {
      expect(() => Logger.debug('Test debug')).not.toThrow();
    });
  });

  describe('context', () => {
    it('should set and use context', () => {
      expect(() => {
        Logger.setContext('TestContext');
        Logger.info('With context');
      }).not.toThrow();
    });

    it('should override previous context', () => {
      expect(() => {
        Logger.setContext('FirstContext');
        Logger.setContext('SecondContext');
        Logger.info('Overridden context');
      }).not.toThrow();
    });
  });

  describe('structured logging', () => {
    it('should accept metadata object', () => {
      expect(() => {
        Logger.info('Structured log', {
          userId: '123',
          action: 'test',
          duration: 150,
          tags: ['test', 'debug'],
        });
      }).not.toThrow();
    });

    it('should handle error objects in metadata', () => {
      expect(() => {
        Logger.error('Operation failed', {
          error: new Error('Something broke'),
          stack: 'Error: Something broke\n    at Object.<anonymous>',
          code: 'ERR_TEST',
        });
      }).not.toThrow();
    });
  });

  describe('error logging patterns', () => {
    it('should log with error level and stack trace', () => {
      const error = new Error('Database connection failed');
      expect(() => {
        Logger.error('Database error occurred', {
          error: error.message,
          stack: error.stack,
          service: 'mongodb',
          database: 'localsite_ai',
        });
      }).not.toThrow();
    });
  });
});
