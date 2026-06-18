import { EventBus } from './EventBus';
import { SystemEvents, UserRegisteredEvent, WebsiteGeneratedEvent, LeadCapturedEvent, PaymentSucceededEvent, DeploymentEvent, GrowthReportEvent } from '../../types/events';
import { QueueService, QueueNames } from '../queue/QueueService';
import { emitToUser, emitToWebsite } from '../socket/SocketSetup';
import { Logger } from '../logging/Logger';
import { AICreditService } from '../../modules/ai/services/AICreditService';

export function registerAllEventHandlers(): void {
  EventBus.on(SystemEvents.USER_REGISTERED, async (payload: UserRegisteredEvent) => {
    await QueueService.addJob(QueueNames.EMAIL, 'welcome-email', {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    });
    Logger.info('Queued welcome email', { userId: payload.userId });
  });

  EventBus.on(SystemEvents.WEBSITE_GENERATED, async (payload: WebsiteGeneratedEvent) => {
    await QueueService.addJob(QueueNames.AI_GENERATION, 'generate-content', {
      websiteId: payload.websiteId,
      businessName: payload.businessName,
      template: payload.template,
    });
    emitToUser(payload.userId, 'website:generating', {
      websiteId: payload.websiteId,
      status: 'processing',
    });
    Logger.info('Queued AI content generation', { websiteId: payload.websiteId });
  });

  EventBus.on(SystemEvents.LEAD_CAPTURED, async (payload: LeadCapturedEvent) => {
    await QueueService.addJob(QueueNames.NOTIFICATION, 'new-lead', {
      leadId: payload.leadId,
      websiteId: payload.websiteId,
      name: payload.name,
      email: payload.email,
    });
    Logger.info('Queued lead notification', { leadId: payload.leadId });
  });

  EventBus.on(SystemEvents.PAYMENT_SUCCEEDED, async (payload: PaymentSucceededEvent) => {
    await QueueService.addJob(QueueNames.EMAIL, 'payment-receipt', {
      userId: payload.userId,
      paymentId: payload.paymentId,
      amount: payload.amount,
      currency: payload.currency,
      plan: payload.plan,
    });

    emitToUser(payload.userId, 'payment:succeeded', {
      paymentId: payload.paymentId,
      amount: payload.amount,
      plan: payload.plan,
    });
    Logger.info('Payment succeeded', {
      userId: payload.userId,
      amount: payload.amount,
      plan: payload.plan,
    });
  });

  EventBus.on(SystemEvents.SUBSCRIPTION_CREATED, async (payload: any) => {
    try {
      const creditService = new AICreditService();
      if (payload.subscriptionId) {
        await creditService.allotSubscriptionCredits(payload.subscriptionId);
      } else if (payload.userId && payload.plan) {
        const { Subscription } = await import('../../modules/payment/models/Subscription');
        const subscription = await Subscription.findOne({
          userId: payload.userId,
          plan: payload.plan,
          status: 'active',
        }).sort({ createdAt: -1 }).lean();
        if (subscription) {
          await creditService.allotSubscriptionCredits(subscription._id.toString());
        }
      }
    } catch (error) {
      Logger.error('Failed to allot subscription credits', { error: (error as Error).message });
    }
  });

  EventBus.on(SystemEvents.DEPLOYMENT_COMPLETED, async (payload: DeploymentEvent) => {
    emitToUser(payload.userId, 'deployment:completed', {
      websiteId: payload.websiteId,
      url: payload.url,
    });
    emitToWebsite(payload.websiteId, 'deployment:live', {
      url: payload.url,
    });
  });

  EventBus.on(SystemEvents.DEPLOYMENT_FAILED, async (payload: DeploymentEvent) => {
    emitToUser(payload.userId, 'deployment:failed', {
      websiteId: payload.websiteId,
      error: payload.error,
    });
    Logger.error('Deployment failed', {
      websiteId: payload.websiteId,
      error: payload.error,
    });
  });

  EventBus.on(SystemEvents.GROWTH_REPORT_GENERATED, async (payload: GrowthReportEvent) => {
    emitToUser(payload.userId, 'growth:report-ready', {
      reportId: payload.reportId,
      websiteId: payload.websiteId,
      scores: payload.scores,
    });
    Logger.info('Growth report generated', {
      reportId: payload.reportId,
      websiteId: payload.websiteId,
    });
  });

  EventBus.on(SystemEvents.AI_GENERATION_COMPLETED, async (payload: any) => {
    emitToUser(payload.userId, 'ai:complete', {
      websiteId: payload.websiteId,
      taskType: payload.taskType,
      usage: payload.usage,
      cost: payload.cost,
    });
  });

  EventBus.on(SystemEvents.AI_GENERATION_FAILED, async (payload: any) => {
    emitToUser(payload.userId, 'ai:failed', {
      websiteId: payload.websiteId,
      taskType: payload.taskType,
      error: payload.error,
    });
  });

  EventBus.on(SystemEvents.AI_CREDITS_LOW, async (payload: any) => {
    emitToUser(payload.userId, 'ai:credits-low', {
      balance: payload.balance,
      taskType: payload.taskType,
      required: payload.required,
    });
  });

  Logger.info('All event handlers registered');
}
