import { Queue, Worker, Job } from 'bullmq';
import type { ConnectionOptions, JobsOptions } from 'bullmq';
import { redisConfig } from '../../config/redis';

export enum QueueNames {
  AI_GENERATION = 'ai-generation',
  EMAIL = 'email',
  WEBSITE_DEPLOYMENT = 'website-deployment',
  GROWTH_ANALYSIS = 'growth-analysis',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  LOGO_GENERATION = 'logo-generation',
  DATA_PROCESSING = 'data-processing',
}

export interface JobHandler {
  (job: Job): Promise<any>;
}

export class QueueService {
  private static queues = new Map<string, Queue>();
  private static workers = new Map<string, Worker>();
  private static connection: ConnectionOptions;

  static initialize(connection: ConnectionOptions): void {
    this.connection = connection;
  }

  static getQueue(name: QueueNames): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600 * 24,
            count: 1000,
          },
          removeOnFail: {
            age: 3600 * 24 * 7,
            count: 1000,
          },
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static async addJob(
    queueName: QueueNames,
    jobName: string,
    data: any,
    options?: JobsOptions
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      ...options,
      timestamp: Date.now(),
    });
  }

  static async addBulk(
    queueName: QueueNames,
    jobs: Array<{ name: string; data: any; opts?: JobsOptions }>
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return queue.addBulk(jobs);
  }

  static createWorker(
    queueName: QueueNames,
    handler: JobHandler,
    concurrency: number = 5
  ): Worker {
    if (this.workers.has(queueName)) {
      this.workers.get(queueName)!.close();
    }

    const worker = new Worker(queueName, handler, {
      connection: this.connection,
      concurrency,
      limiter: {
        max: 100,
        duration: 1000,
      },
    });

    worker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, err.message);
    });

    worker.on('error', (err: Error) => {
      console.error(`Worker error in queue ${queueName}:`, err.message);
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  static async getQueueMetrics(name: QueueNames): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(name);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  static async closeAll(): Promise<void> {
    const closeWorkers = Array.from(this.workers.values()).map((w) => w.close());
    const closeQueues = Array.from(this.queues.values()).map((q) => q.close());
    await Promise.all([...closeWorkers, ...closeQueues]);
    this.workers.clear();
    this.queues.clear();
  }

  static async pauseQueue(name: QueueNames): Promise<void> {
    const queue = this.getQueue(name);
    await queue.pause();
  }

  static async resumeQueue(name: QueueNames): Promise<void> {
    const queue = this.getQueue(name);
    await queue.resume();
  }
}
