import { emitToUser } from '../../../../core/socket/SocketSetup';
import { Logger } from '../../../../core/logging/Logger';

export class ProgressEmitter {
  constructor(private userId: string, private websiteId: string) {}

  emitProgress(message: string, percentage: number) {
    Logger.info(`Website Generation Progress: ${percentage}% - ${message}`, {
      userId: this.userId,
      websiteId: this.websiteId,
      percentage
    });

    emitToUser(this.userId, 'ai:progress', {
      websiteId: this.websiteId,
      taskType: 'website-generation',
      step: message,
      progress: percentage,
    });
  }

  emitError(errorMessage: string, diagnostic?: any) {
    Logger.error('Website Generation Error Emitted', {
      userId: this.userId,
      websiteId: this.websiteId,
      error: errorMessage,
      diagnostic
    });

    emitToUser(this.userId, 'ai:error', {
      websiteId: this.websiteId,
      taskType: 'website-generation',
      error: errorMessage,
      diagnostic: diagnostic || { type: 'unknown', suggestion: 'Please try again later.' }
    });
  }
}
