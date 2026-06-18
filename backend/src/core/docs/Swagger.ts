import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response, NextFunction } from 'express';
import config from '../../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LocalSite AI API',
      version: '2.0.0',
      description: 'Production SaaS API for LocalSite AI - AI-powered website builder with analytics, CRM, billing, and growth tools.',
      contact: {
        name: 'LocalSite AI Support',
        email: 'support@localsiteai.com',
        url: 'https://localsiteai.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    externalDocs: {
      description: 'GitHub Repository',
      url: 'https://github.com/localsite-ai/localsite-ai',
    },
    servers: [
      { url: `http://localhost:${config.port}/api`, description: 'Development' },
      { url: 'https://api.localsiteai.com/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'HTTP-only refresh token cookie for token renewal',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
            code: { type: 'string', example: 'NOT_FOUND' },
            stack: { type: 'string', description: 'Stack trace (development only)' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: { '$ref': '#/components/schemas/Pagination' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d5f484f1a2c8b1f8e4e1a1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin', 'agency_owner', 'team_member'], example: 'user' },
            avatar: { type: 'string', nullable: true },
            emailVerified: { type: 'boolean', example: true },
            preferences: {
              type: 'object',
              properties: {
                theme: { type: 'string', enum: ['light', 'dark'] },
                notifications: { type: 'boolean' },
                emailReports: { type: 'boolean' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT access token (15m expiry)' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'P@ssw0rd123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'P@ssw0rd123' },
          },
        },
        Website: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            businessName: { type: 'string', example: 'Joe\'s Pizza' },
            category: { type: 'string', example: 'restaurant' },
            location: { type: 'string', example: 'New York, NY' },
            phone: { type: 'string', example: '+1 212-555-0100' },
            email: { type: 'string', example: 'info@joespizza.com' },
            subdomain: { type: 'string', example: 'joes-pizza-a1b2' },
            domain: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            template: { type: 'string' },
            analytics: {
              type: 'object',
              properties: {
                pageViews: { type: 'integer' },
                uniqueVisitors: { type: 'integer' },
                leads: { type: 'integer' },
                avgSessionDuration: { type: 'integer' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateWebsiteRequest: {
          type: 'object',
          required: ['businessName', 'category', 'location', 'phone', 'email'],
          properties: {
            businessName: { type: 'string', minLength: 2, maxLength: 100, example: 'Joe\'s Pizza' },
            category: { type: 'string', example: 'restaurant' },
            location: { type: 'string', maxLength: 200, example: 'New York, NY' },
            phone: { type: 'string', pattern: '^\\+?[\\d\\s-]{10,15}$', example: '+1 212-555-0100' },
            email: { type: 'string', format: 'email', example: 'info@joespizza.com' },
            template: { type: 'string', optional: true, example: 'modern' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            websiteId: { type: 'string' },
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            phone: { type: 'string', nullable: true },
            company: { type: 'string', nullable: true },
            message: { type: 'string' },
            source: { type: 'string', example: 'contact_form' },
            status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted', 'lost'] },
            score: { type: 'integer', minimum: 0, maximum: 100 },
            tags: { type: 'array', items: { type: 'string' } },
            notes: { type: 'array', items: { type: 'object' } },
            assignedTo: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            plan: { type: 'string', enum: ['starter', 'professional', 'business', 'enterprise'] },
            status: { type: 'string', enum: ['active', 'trialing', 'cancelled', 'expired', 'past_due'] },
            provider: { type: 'string', enum: ['stripe', 'razorpay'] },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAtPeriodEnd: { type: 'boolean' },
            features: { type: 'array', items: { type: 'string' } },
            price: { type: 'integer', example: 2999 },
            currency: { type: 'string', example: 'USD' },
            interval: { type: 'string', enum: ['monthly', 'yearly'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            subscriptionId: { type: 'string' },
            amount: { type: 'integer', example: 2999 },
            currency: { type: 'string', example: 'USD' },
            provider: { type: 'string', enum: ['stripe', 'razorpay'] },
            status: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'refunded'] },
            plan: { type: 'string' },
            interval: { type: 'string', enum: ['monthly', 'yearly'] },
            receiptUrl: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AnalyticsEvent: {
          type: 'object',
          required: ['websiteId', 'visitorId', 'page', 'sessionId'],
          properties: {
            websiteId: { type: 'string' },
            visitorId: { type: 'string' },
            page: { type: 'string', example: '/' },
            referrer: { type: 'string', nullable: true },
            device: { type: 'string', example: 'desktop' },
            browser: { type: 'string', example: 'Chrome' },
            os: { type: 'string', example: 'Windows' },
            country: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            sessionId: { type: 'string' },
            duration: { type: 'integer', example: 120 },
            bounce: { type: 'boolean', example: false },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['system', 'growth', 'lead', 'deployment', 'payment', 'marketing', 'mention', 'subscription'] },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AdminDashboard: {
          type: 'object',
          properties: {
            mrr: { type: 'integer', example: 29900 },
            arr: { type: 'integer', example: 358800 },
            churn: { type: 'number', example: 2.5 },
            activeUsers: { type: 'integer', example: 150 },
            totalRevenue: { type: 'integer', example: 500000 },
            aiRequests: { type: 'integer', example: 12500 },
            growthPercent: { type: 'number', example: 15.5 },
            charts: {
              type: 'object',
              properties: {
                revenue: { type: 'array', items: { type: 'object' } },
                subscriptions: { type: 'object' },
                users: { type: 'object' },
                websites: { type: 'object' },
              },
            },
          },
        },
        GrowthDashboard: {
          type: 'object',
          properties: {
            overallScore: { type: 'integer' },
            scores: {
              type: 'object',
              properties: {
                businessHealth: { type: 'integer' },
                seo: { type: 'integer' },
                leads: { type: 'integer' },
                conversion: { type: 'integer' },
                satisfaction: { type: 'integer' },
              },
            },
            insights: { type: 'array', items: { type: 'object' } },
            recentReports: { type: 'array', items: { type: 'object' } },
          },
        },
        Deployment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            websiteId: { type: 'string' },
            userId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'building', 'deploying', 'live', 'failed'] },
            url: { type: 'string', nullable: true },
            domain: { type: 'string', nullable: true },
            sslStatus: { type: 'string', enum: ['active', 'pending', 'failed', 'none'] },
            commitMessage: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } },
        },
        RateLimited: {
          description: 'Too many requests',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization endpoints' },
      { name: 'Users', description: 'User profile & preferences management' },
      { name: 'Websites', description: 'Website CRUD, generation & publishing' },
      { name: 'Analytics', description: 'Website analytics tracking & reporting' },
      { name: 'Leads', description: 'Lead management & CRM operations' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Payments', description: 'Subscription & payment processing' },
      { name: 'Deployments', description: 'Website deployment & domain management' },
      { name: 'Growth', description: 'Business growth insights & reports' },
      { name: 'Notifications', description: 'In-app notification management' },
      { name: 'Admin', description: 'Administrative operations & analytics' },
      { name: 'Contact', description: 'Contact form submissions' },
      { name: 'Health', description: 'Server health check' },
    ],
  },
  apis: [],
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LocalSite AI - API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
    },
  }));

  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });

  app.get('/api/docs.yaml', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const YAML = require('js-yaml');
      const yamlSpec = YAML.dump(spec, { indent: 2 });
      res.setHeader('Content-Type', 'text/yaml');
      res.send(yamlSpec);
    } catch (err) {
      next(err);
    }
  });
}

export default spec;
