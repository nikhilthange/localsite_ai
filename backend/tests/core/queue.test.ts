import { Queue } from 'bullmq';
import { QueueService, QueueNames } from '../../src/core/queue/QueueService';

vi.mock('bullmq', () => ({
  Queue: vi.fn(),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

describe('QueueService', () => {
  let mockQueue: any;

  beforeAll(() => {
    QueueService.initialize({
      host: 'localhost',
      port: 6379,
      password: 'test',
    });
  });

  beforeEach(async () => {
    await QueueService.closeAll().catch(() => {});
    mockQueue = {
      add: vi.fn(),
      addBulk: vi.fn(),
      getWaitingCount: vi.fn(),
      getActiveCount: vi.fn(),
      getCompletedCount: vi.fn(),
      getFailedCount: vi.fn(),
      getDelayedCount: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      close: vi.fn(),
    };
    (Queue as vi.Mock).mockImplementation(() => mockQueue);
  });

  afterAll(async () => {
    await QueueService.closeAll();
  });

  describe('addJob', () => {
    it('should add a job to a queue', async () => {
      mockQueue.add.mockResolvedValue({ id: 'job-1', name: 'test-job', data: { type: 'test' } });

      const result = await QueueService.addJob(QueueNames.AI_GENERATION, 'test-job', { type: 'test' });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'test-job',
        { type: 'test' },
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('job-1');
    });
  });

  describe('getQueueMetrics', () => {
    it('should return job metrics for a queue', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(5);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(3);
      mockQueue.getDelayedCount.mockResolvedValue(0);

      const metrics = await QueueService.getQueueMetrics(QueueNames.AI_GENERATION);

      expect(metrics.waiting).toBe(5);
      expect(metrics.active).toBe(2);
      expect(metrics.completed).toBe(100);
      expect(metrics.failed).toBe(3);
      expect(metrics.delayed).toBe(0);
    });
  });

  describe('pause/resume', () => {
    it('should pause and resume a queue', async () => {
      mockQueue.pause.mockResolvedValue(undefined);
      mockQueue.resume.mockResolvedValue(undefined);

      await QueueService.pauseQueue(QueueNames.EMAIL);
      expect(mockQueue.pause).toHaveBeenCalled();

      await QueueService.resumeQueue(QueueNames.EMAIL);
      expect(mockQueue.resume).toHaveBeenCalled();
    });
  });

  describe('closeAll', () => {
    it('should close all queues gracefully', async () => {
      mockQueue.close.mockResolvedValue(undefined);
      await expect(QueueService.closeAll()).resolves.not.toThrow();
    });
  });
});
