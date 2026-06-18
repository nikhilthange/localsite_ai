import { QueueService } from '../core/queue/QueueService';
import config from '../config';
import { DatabaseConnection } from '../core/database/Connection';
import { Logger } from '../core/logging/Logger';

async function startWorkers(): Promise<void> {
  Logger.initialize();
  Logger.setContext('Worker');

  await DatabaseConnection.getInstance().connect(config.mongodb.uri);

  QueueService.initialize({
    host: config.bullmq.connection.host,
    port: config.bullmq.connection.port,
    password: config.bullmq.connection.password,
  });

  const { registerEmailWorker } = await import('./EmailWorker');
  const { registerAIWorker } = await import('./AIWorker');
  const { registerNotificationWorker } = await import('./NotificationWorker');
  const { registerDeploymentWorker } = await import('./DeploymentWorker');

  registerEmailWorker();
  registerAIWorker();
  registerNotificationWorker();
  registerDeploymentWorker();

  Logger.info('All queue workers registered');
}

startWorkers().catch((err) => {
  Logger.error('Failed to start workers', { error: err.message });
  process.exit(1);
});
