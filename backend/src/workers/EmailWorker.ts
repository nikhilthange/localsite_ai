import { Job } from 'bullmq';
import { QueueService, QueueNames } from '../core/queue/QueueService';
import { Logger } from '../core/logging/Logger';
import { EmailService } from '../modules/notification/services/EmailService';

export function registerEmailWorker(): void {
  QueueService.createWorker(QueueNames.EMAIL, async (job: Job) => {
    Logger.info('Processing email job', { jobId: job.id, name: job.name });

    switch (job.name) {
      case 'welcome-email':
        await EmailService.sendWelcomeEmail(job.data.email, job.data.name);
        break;
      case 'payment-receipt':
        await EmailService.sendPaymentReceipt(job.data);
        break;
      case 'password-reset':
        await EmailService.sendPasswordResetEmail(job.data.email, job.data.token);
        break;
      case 'weekly-report':
        await EmailService.sendWeeklyReport(job.data);
        break;
      case 'verification-email':
        await EmailService.sendVerificationEmail(job.data.email, job.data.token);
        break;
      default:
        Logger.warn('Unknown email job type', { name: job.name });
    }
  }, 10);
}
