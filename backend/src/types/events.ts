export enum SystemEvents {
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  USER_LOGGED_IN = 'user.logged_in',
  USER_PASSWORD_RESET = 'user.password_reset',
  WEBSITE_CREATED = 'website.created',
  WEBSITE_DEPLOYED = 'website.deployed',
  WEBSITE_DELETED = 'website.deleted',
  WEBSITE_GENERATED = 'website.generated',
  LEAD_CAPTURED = 'lead.captured',
  LEAD_CONVERTED = 'lead.converted',
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SUBSCRIPTION_EXPIRED = 'subscription.expired',
  GROWTH_REPORT_GENERATED = 'growth.report_generated',
  INSIGHT_CREATED = 'insight.created',
  CHATBOT_MESSAGE = 'chatbot.message',
  CHATBOT_LEAD_CAPTURED = 'chatbot.lead_captured',
  DEPLOYMENT_STARTED = 'deployment.started',
  DEPLOYMENT_COMPLETED = 'deployment.completed',
  DEPLOYMENT_FAILED = 'deployment.failed',
  AI_GENERATION_COMPLETED = 'ai.generation_completed',
  AI_GENERATION_FAILED = 'ai.generation_failed',
  AI_CREDITS_LOW = 'ai.credits_low',
  NOTIFICATION_SENT = 'notification.sent',
  ERROR_OCCURRED = 'error.occurred',
  AUDIT_LOG = 'audit.log',
}

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  timestamp: Date;
}

export interface WebsiteGeneratedEvent {
  websiteId: string;
  userId: string;
  businessName: string;
  template: string;
  timestamp: Date;
}

export interface LeadCapturedEvent {
  leadId: string;
  websiteId: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  timestamp: Date;
}

export interface PaymentSucceededEvent {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  plan: string;
  timestamp: Date;
}

export interface GrowthReportEvent {
  reportId: string;
  userId: string;
  websiteId: string;
  scores: Record<string, number>;
  timestamp: Date;
}

export interface DeploymentEvent {
  deploymentId: string;
  websiteId: string;
  userId: string;
  status: 'started' | 'completed' | 'failed';
  url?: string;
  error?: string;
  timestamp: Date;
}

export type EventPayloads = {
  [SystemEvents.USER_REGISTERED]: UserRegisteredEvent;
  [SystemEvents.WEBSITE_GENERATED]: WebsiteGeneratedEvent;
  [SystemEvents.LEAD_CAPTURED]: LeadCapturedEvent;
  [SystemEvents.PAYMENT_SUCCEEDED]: PaymentSucceededEvent;
  [SystemEvents.GROWTH_REPORT_GENERATED]: GrowthReportEvent;
  [SystemEvents.DEPLOYMENT_STARTED]: DeploymentEvent;
  [SystemEvents.DEPLOYMENT_COMPLETED]: DeploymentEvent;
  [SystemEvents.DEPLOYMENT_FAILED]: DeploymentEvent;
};

export type EventCallback<T = any> = (payload: T) => Promise<void> | void;
