import { Job } from 'bullmq';
import { QueueService, QueueNames } from '../core/queue/QueueService';
import { Logger } from '../core/logging/Logger';

export function registerNotificationWorker(): void {
  QueueService.createWorker(QueueNames.NOTIFICATION, async (job: Job) => {
    Logger.info('Processing notification job', { jobId: job.id, name: job.name });

    const notificationService = new (await import('../modules/notification/services/NotificationService')).NotificationService();

    switch (job.name) {
      case 'new-lead': {
        await notificationService.create(
          job.data.userId,
          'lead',
          'New Lead Captured',
          'A new lead (' + job.data.name + ') was captured from your website.',
          { leadId: job.data.leadId, websiteId: job.data.websiteId }
        );
        break;
      }
      case 'deployment-success': {
        await notificationService.create(
          job.data.userId,
          'deployment',
          'Website Deployed',
          'Your website is now live at ' + job.data.url,
          { websiteId: job.data.websiteId, url: job.data.url }
        );
        break;
      }
      case 'deployment-failed': {
        await notificationService.create(
          job.data.userId,
          'deployment',
          'Deployment Failed',
          'Your website deployment failed: ' + job.data.error,
          { websiteId: job.data.websiteId, error: job.data.error }
        );
        break;
      }
      case 'growth-insight': {
        await notificationService.create(
          job.data.userId,
          'growth',
          job.data.title || 'New Business Insight',
          job.data.message,
          { insightId: job.data.insightId, websiteId: job.data.websiteId }
        );
        break;
      }
      default:
        Logger.warn('Unknown notification job type', { name: job.name });
    }
  }, 10);
}
