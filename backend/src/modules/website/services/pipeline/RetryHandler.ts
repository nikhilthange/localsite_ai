import { Logger } from '../../../../core/logging/Logger';

export interface RetryOptions {
  maxRetries: number;
  delays: number[];
  onRetry?: (error: any, attempt: number, delay: number) => void;
  onTimeoutConsecutive?: (consecutiveTimeouts: number) => void;
}

export class RetryHandler {
  private consecutiveTimeouts = 0;

  async executeWithRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
    let attempt = 0;
    const maxRetries = options.maxRetries;

    while (attempt <= maxRetries) {
      try {
        const result = await operation();
        // Reset consecutive timeouts on success
        this.consecutiveTimeouts = 0;
        return result;
      } catch (error: any) {
        const isTimeout = this.isTimeoutError(error);
        if (isTimeout) {
          this.consecutiveTimeouts++;
          if (options.onTimeoutConsecutive) {
            options.onTimeoutConsecutive(this.consecutiveTimeouts);
          }
        } else {
          // If it failed for a non-timeout reason, we do not reset consecutive timeouts, 
          // or we can, depending on strictness. We'll leave it as is.
        }

        const isRetryable = this.isRetryableError(error, isTimeout);

        if (!isRetryable || attempt === maxRetries) {
          Logger.error('Operation failed after retries or non-retryable error', { attempt, maxRetries, error: error?.message });
          throw error;
        }

        const delay = options.delays[Math.min(attempt, options.delays.length - 1)] || 1000;
        
        if (options.onRetry) {
          options.onRetry(error, attempt + 1, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      }
    }
    throw new Error('Unreachable code in executeWithRetry');
  }

  private isTimeoutError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || '';
    const status = error?.status || error?.response?.status;
    const code = error?.code || error?.diagnostic?.type;
    return (
      error?.name === 'TimeoutError' ||
      msg.includes('timeout') ||
      msg.includes('abort') ||
      code === 'ETIMEDOUT' ||
      code === 'ECONNABORTED' ||
      code === 'client_timeout' ||
      code === 'server_timeout' ||
      status === 504
    );
  }

  private isRetryableError(error: any, isTimeout: boolean): boolean {
    if (isTimeout) return true;

    const status = error?.status || error?.response?.status;
    const code = error?.code;
    const msg = error?.message?.toLowerCase() || '';

    // Retry only on: 429, 500, 502, 503, 504, Connection timeout
    if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
      return true;
    }

    if (code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ENOTFOUND') {
      return true;
    }

    if (msg.includes('network error') || msg.includes('econnrefused') || msg.includes('econnreset') || msg.includes('enotfound')) {
      return true;
    }

    return false;
  }
}
