declare module 'bullmq' {
  import { EventEmitter } from 'events';

  export type ConnectionOptions = { host?: string; port?: number; password?: string; [key: string]: any };

  export type JobsOptions = {
    attempts?: number;
    backoff?: { type: string; delay: number };
    removeOnComplete?: boolean | { age: number; count: number };
    removeOnFail?: boolean | { age: number; count: number };
    delay?: number;
    [key: string]: any;
  };

  export interface QueueOptions {
    connection?: ConnectionOptions;
    prefix?: string;
    defaultJobOptions?: JobsOptions;
    [key: string]: any;
  }

  export interface Job<T = any, R = any> {
    id: string;
    name: string;
    data: T;
    returnvalue: R;
    opts: any;
    timestamp: number;
    attemptsMade: number;
    [key: string]: any;
    update(data: any): Promise<void>;
    updateProgress(progress: any): Promise<void>;
    remove(): Promise<void>;
    discard(): Promise<void>;
    toJSON(): Record<string, any>;
    retry(): Promise<void>;
    promote(): Promise<void>;
    getState(): Promise<string>;
  }

  export interface WorkerOptions {
    connection?: any;
    prefix?: string;
    concurrency?: number;
    limiter?: { max: number; duration: number };
    [key: string]: any;
  }

  export type Processor<T = any, R = any> = (job: Job<T, R>) => Promise<R>;

  export class Queue<T = any> extends EventEmitter {
    constructor(name: string, opts?: QueueOptions);
    add(name: string, data: T, opts?: JobsOptions): Promise<Job<T>>;
    getJob(jobId: string): Promise<Job<T> | undefined>;
    getJobs(types?: string[]): Promise<Job<T>[]>;
    close(): Promise<void>;
    [key: string]: any;
  }

  export class Worker<T = any, R = any> extends EventEmitter {
    constructor(name: string, processor?: Processor<T, R>, opts?: WorkerOptions);
    [key: string]: any;
    close(force?: boolean): Promise<void>;
  }

  export class QueueScheduler {
    constructor(name: string, opts?: { connection?: any; prefix?: string });
    close(): Promise<void>;
  }

  export class QueueEvents {
    constructor(name: string, opts?: { connection?: any; prefix?: string });
    close(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}

declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xssClean(): RequestHandler;
  export default xssClean;
}
