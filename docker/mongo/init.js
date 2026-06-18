db = db.getSiblingDB('localsite_ai');

db.createCollection('users');
db.createCollection('websites');
db.createCollection('templates');
db.createCollection('leads');
db.createCollection('customers');
db.createCollection('payments');
db.createCollection('subscriptions');
db.createCollection('notifications');
db.createCollection('deployments');
db.createCollection('analytics');
db.createCollection('chatbots');
db.createCollection('weeklyreports');
db.createCollection('businessinsights');
db.createCollection('campaigns');
db.createCollection('appointments');
db.createCollection('auditlogs');

// ============= USERS =============
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ role: 1, isActive: 1 });
db.users.createIndex({ agencyId: 1, role: 1 });
db.users.createIndex({ lastLogin: -1 });
db.users.createIndex({ createdAt: -1 });

// ============= WEBSITES =============
db.websites.createIndex({ userId: 1, status: 1 });
db.websites.createIndex({ subdomain: 1 }, { unique: true });
db.websites.createIndex({ status: 1, publishedAt: -1 });
db.websites.createIndex({ businessName: 'text' });
db.websites.createIndex({ category: 1, status: 1 });
db.websites.createIndex({ userId: 1, updatedAt: -1 });

// ============= LEADS =============
db.leads.createIndex({ websiteId: 1, status: 1 });
db.leads.createIndex({ websiteId: 1, createdAt: -1 });
db.leads.createIndex({ email: 1, websiteId: 1 }, { unique: true, sparse: true });
db.leads.createIndex({ assignedTo: 1, status: 1 });
db.leads.createIndex({ websiteId: 1, source: 1 });

// ============= CUSTOMERS =============
db.customers.createIndex({ websiteId: 1, email: 1 }, { unique: true, sparse: true });
db.customers.createIndex({ userId: 1, lastContact: -1 });

// ============= PAYMENTS =============
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ providerPaymentId: 1 }, { unique: true, sparse: true });
db.payments.createIndex({ status: 1, createdAt: -1 });
db.payments.createIndex({ subscriptionId: 1 });

// ============= SUBSCRIPTIONS =============
db.subscriptions.createIndex({ userId: 1 }, { unique: true });
db.subscriptions.createIndex({ status: 1, currentPeriodEnd: 1 });
db.subscriptions.createIndex({ plan: 1, status: 1 });

// ============= NOTIFICATIONS =============
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1, createdAt: -1 });

// ============= ANALYTICS =============
db.analytics.createIndex({ websiteId: 1, timestamp: -1 });
db.analytics.createIndex({ websiteId: 1, page: 1, timestamp: -1 });
db.analytics.createIndex({ visitorId: 1, timestamp: -1 });
db.analytics.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// ============= DEPLOYMENTS =============
db.deployments.createIndex({ websiteId: 1, createdAt: -1 });
db.deployments.createIndex({ status: 1 });

// ============= BUSINESS INSIGHTS =============
db.businessinsights.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.businessinsights.createIndex({ websiteId: 1, category: 1, severity: 1 });

// ============= WEEKLY REPORTS =============
db.weeklyreports.createIndex({ websiteId: 1, weekStart: -1 });
db.weeklyreports.createIndex({ userId: 1, weekStart: -1 });

// ============= CHATBOTS =============
db.chatbots.createIndex({ websiteId: 1 }, { unique: true });

// ============= CAMPAIGNS =============
db.campaigns.createIndex({ websiteId: 1, status: 1 });
db.campaigns.createIndex({ scheduledFor: 1, status: 1 });

// ============= APPOINTMENTS =============
db.appointments.createIndex({ websiteId: 1, startTime: 1 });
db.appointments.createIndex({ customerId: 1 });

// ============= AUDIT LOGS =============
db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ resource: 1, resourceId: 1 });
db.auditlogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

print('MongoDB initialization complete for localsite_ai');
