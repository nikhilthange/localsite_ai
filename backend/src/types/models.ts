// Re-exports for backward compatibility
// New code should import from the per-module type files directly.
export type { UserRole } from './auth';
export type { IUser } from './auth';

export type { WebsiteStatus, IWebsite, ITemplate } from './website';

export type { SubscriptionStatus, IPayment, ISubscription } from './payment';

export type { IAnalytics } from './analytics';

export type { INotification } from './notification';

export type { DeploymentStatus, IDeployment } from './deployment';

export type { ILead, ICustomer, IAppointment } from './crm';

export type { SeverityLevel, InsightCategory, IWeeklyReport, IBusinessInsight } from './growth';

export type { ICampaign } from './marketing';

export type { IChatbot } from './chatbot';

export type { IAuditLog } from './audit';
