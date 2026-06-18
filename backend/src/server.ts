import 'reflect-metadata';
import { config } from './config';
import { DatabaseConnection } from './core/database/Connection';
import { EventBus } from './core/events/EventBus';
import { QueueService } from './core/queue/QueueService';
import { CacheService } from './core/cache/CacheService';
import { Logger } from './core/logging/Logger';
import { RedisSocketAdapter } from './core/socket/RedisSocketAdapter';

import app from './app';
import { createServer } from 'http';

const httpServer = createServer(app);

async function bootstrap(): Promise<void> {
  try {
    Logger.initialize();
    Logger.setContext('Bootstrap');
    EventBus.initialize();

    await DatabaseConnection.getInstance().connect(config.mongodb.uri);

    await CacheService.initialize(config.redis.url);

    QueueService.initialize({
      host: config.bullmq.connection.host,
      port: config.bullmq.connection.port,
      password: config.bullmq.connection.password,
    });

    const { setupSocketIO } = await import('./core/socket/SocketSetup');
    setupSocketIO(httpServer);

    const { registerAllEventHandlers } = await import('./core/events/EventHandlers');
    registerAllEventHandlers();

    const { startWeeklyReportCron, startDailyInsightCron } = await import('./modules/growth/jobs/GrowthCron');
    startWeeklyReportCron();
    startDailyInsightCron();

    httpServer.listen(config.port, () => {
      Logger.info('Server started', {
        port: config.port,
        env: config.env,
        url: config.app.url,
        features: {
          redis: CacheService.isConnected,
          queue: true,
          websocket: true,
          cdn: !!config.cloudflare.domain,
          s3: !!config.aws.s3Bucket,
        },
      });
    });
  } catch (error) {
    Logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: Error) => {
  Logger.error('Unhandled Rejection', { error: reason.message, stack: reason.stack });
});

process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received. Shutting down gracefully...');
  await QueueService.closeAll();
  await CacheService.disconnect();
  await DatabaseConnection.getInstance().disconnect();
  process.exit(0);
});

bootstrap();
