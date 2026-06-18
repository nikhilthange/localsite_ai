import { Job } from 'bullmq';
import { QueueService, QueueNames } from '../core/queue/QueueService';
import { Logger } from '../core/logging/Logger';
import { EventBus } from '../core/events/EventBus';
import { SystemEvents } from '../types/events';

export function registerDeploymentWorker(): void {
  QueueService.createWorker(QueueNames.WEBSITE_DEPLOYMENT, async (job: Job) => {
    Logger.info('Processing deployment job', { jobId: job.id, websiteId: job.data.websiteId });

    try {
      EventBus.emit(SystemEvents.DEPLOYMENT_STARTED, {
        deploymentId: job.data.deploymentId,
        websiteId: job.data.websiteId,
        userId: job.data.userId,
        status: 'started',
        timestamp: new Date(),
      });

      const { DeploymentService } = await import('../modules/deployment/services/DeploymentService');
      const deploymentService = new DeploymentService();
      const result = await deploymentService.deployWebsite(
        job.data.websiteId,
        job.data.userId
      );
      const url = result?.url || '';

      EventBus.emit(SystemEvents.DEPLOYMENT_COMPLETED, {
        deploymentId: job.data.deploymentId,
        websiteId: job.data.websiteId,
        userId: job.data.userId,
        status: 'completed',
        url,
        timestamp: new Date(),
      });

      await QueueService.addJob(QueueNames.NOTIFICATION, 'deployment-success', {
        userId: job.data.userId,
        websiteId: job.data.websiteId,
        url,
      });
    } catch (err) {
      EventBus.emit(SystemEvents.DEPLOYMENT_FAILED, {
        deploymentId: job.data.deploymentId,
        websiteId: job.data.websiteId,
        userId: job.data.userId,
        status: 'failed',
        error: (err as Error).message,
        timestamp: new Date(),
      });

      await QueueService.addJob(QueueNames.NOTIFICATION, 'deployment-failed', {
        userId: job.data.userId,
        websiteId: job.data.websiteId,
        error: (err as Error).message,
      });

      throw err;
    }
  }, 3);
}
