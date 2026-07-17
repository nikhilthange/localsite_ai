import 'reflect-metadata';
import { config, validateEnvironment } from './config';
import { DatabaseConnection } from './core/database/Connection';
import { EventBus } from './core/events/EventBus';
import { QueueService } from './core/queue/QueueService';
import { CacheService } from './core/cache/CacheService';
import { Logger } from './core/logging/Logger';
import { RedisSocketAdapter } from './core/socket/RedisSocketAdapter';

import app from './app';
import { createServer } from 'http';

const httpServer = createServer(app);

httpServer.on('clientError', (err, socket) => {
  if ((err as NodeJS.ErrnoException).code === 'ECONNRESET') {
    Logger.debug('Client connection reset');
  } else {
    Logger.warn('HTTP client error', { error: err.message });
  }
  socket.destroy();
});

httpServer.on('error', (err) => {
  Logger.error('HTTP server error', { error: err.message });
});

function printBanner(): void {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║        LocalSite AI - Server              ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
}

async function bootstrap(): Promise<void> {
  printBanner();

  try {
    // Step 1: Initialize Logger
    Logger.initialize();
    Logger.setContext('Bootstrap');
    EventBus.initialize();
    console.log('✓ Logger initialized');

    // Step 2: Validate environment variables
    console.log('\n── Environment Validation ──');
    const envCheck = validateEnvironment();
    if (!envCheck.valid) {
      for (const err of envCheck.errors) {
        console.error('  ✗ ' + err);
      }
    } else {
      console.log('  ✓ All required env vars present');
    }

    // Summary of optional features
    console.log('');
    console.log('── Feature Status ──');
    console.log('  ' + (config.nvidia.enabled ? '✓' : '○') + ' AI Engine (NVIDIA)       ' + (config.nvidia.enabled ? 'enabled' : 'disabled — set NVIDIA_API_KEY'));
    console.log('  ' + (config.stripe.enabled ? '✓' : '○') + ' Stripe Payments         ' + (config.stripe.enabled ? 'enabled' : 'disabled — set STRIPE_SECRET_KEY'));
    console.log('  ' + (config.razorpay.enabled ? '✓' : '○') + ' Razorpay Payments       ' + (config.razorpay.enabled ? 'enabled' : 'disabled — set RAZORPAY_KEY_ID'));
    console.log('  ' + (config.aws.enabled ? '✓' : '○') + ' AWS S3 Storage          ' + (config.aws.enabled ? 'enabled' : 'disabled — set AWS_* vars'));
    console.log('  ' + (config.cloudflare.enabled ? '✓' : '○') + ' Cloudflare CDN          ' + (config.cloudflare.enabled ? 'enabled' : 'disabled — set CLOUDFLARE_* vars'));
    console.log('  ' + (config.email.enabled ? '✓' : '○') + ' Email Service           ' + (config.email.enabled ? 'enabled' : 'disabled — set SENDGRID_API_KEY or SMTP_* vars'));
    console.log('  ' + (config.app.googleOAuth.enabled ? '✓' : '○') + ' Google OAuth           ' + (config.app.googleOAuth.enabled ? 'enabled' : 'disabled — set GOOGLE_CLIENT_* vars'));
    const skipEmailVerify = process.env.SKIP_EMAIL_VERIFICATION === 'true' && config.isDevelopment;
    if (skipEmailVerify) {
      console.log('  ~ Email Verification Bypass Enabled (Development)');
    }

    // Step 3: Connect MongoDB
    console.log('\n── Database ──');
    await DatabaseConnection.getInstance().connect(config.mongodb.uri);

    // Step 4: Connect Redis (gracefully handles failure)
    console.log('');
    console.log('── Cache & Queue ──');
    await CacheService.initialize(config.redis.url);

    // Step 5: Initialize Queue Service
    const redisAvailable = CacheService.isConnected;
    QueueService.setEnabled(redisAvailable);
    if (redisAvailable) {
      QueueService.initialize({
        host: config.bullmq.connection.host,
        port: config.bullmq.connection.port,
        password: config.bullmq.connection.password,
      });
    }
    console.log('  ' + (redisAvailable ? '✓' : '○') + ' Redis                  ' + (redisAvailable ? 'Connected' : 'Disabled (Development)'));
    console.log('  ' + (redisAvailable ? '✓' : '○') + ' Queue Engine (BullMQ)  ' + (redisAvailable ? 'Ready' : 'Disabled'));

    // Step 6: Mount Bull Board (queue dashboard)
    console.log('');
    console.log('── Admin Dashboard ──');
    if (redisAvailable) {
      try {
        const { mountBullBoard } = await import('./core/queue/BullBoard');
        mountBullBoard(app);
        console.log('  ✓ Bull Board mounted at /admin/queues');
      } catch (error: any) {
        console.warn('  ○ Bull Board unavailable:', error.message);
      }
    } else {
      console.log('  ○ Bull Board disabled (requires Redis)');
    }

    // Step 7: Initialize Socket.IO
    console.log('');
    console.log('── WebSocket ──');
    const { setupSocketIO } = await import('./core/socket/SocketSetup');
    setupSocketIO(httpServer);
    console.log('✓ Socket.IO initialized');

    // Step 7: Register Event Handlers
    const { registerAllEventHandlers } = await import('./core/events/EventHandlers');
    registerAllEventHandlers();
    console.log('✓ Event handlers registered');

    // Step 8: Start Cron Jobs
    console.log('');
    console.log('── Scheduled Jobs ──');
    try {
      const { startWeeklyReportCron, startDailyInsightCron } = await import('./modules/growth/jobs/GrowthCron');
      startWeeklyReportCron();
      startDailyInsightCron();
      console.log('✓ Cron jobs registered');
    } catch (error: any) {
      console.warn('○ Cron jobs unavailable:', error.message);
    }

    // Step 9: Start HTTP Server
    console.log('');
    httpServer.listen(config.port, () => {
      console.log('╔══════════════════════════════════════════╗');
      console.log('║         Server is running!               ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log('║  Environment : ' + config.env.padEnd(28) + '║');
      console.log('║  Port        : ' + String(config.port).padEnd(28) + '║');
      console.log('║  API         : http://localhost:' + String(config.port).padEnd(17) + '║');
      if (redisAvailable) {
        console.log('║  Dashboard   : http://localhost:' + String(config.port) + '/admin/queues' + '║');
      }
      console.log('╚══════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('');
    console.error('╔══════════════════════════════════════════╗');
    console.error('║       SERVER STARTUP FAILED              ║');
    console.error('╚══════════════════════════════════════════╝');
    console.error('');
    console.error('  ' + (error as Error).message);
    console.error('');
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
