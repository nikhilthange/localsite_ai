import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { SecurityMiddleware } from './core/security/SecurityMiddleware';
import { RateLimiter } from './core/security/RateLimiter';
import { errorHandler } from './core/security/ErrorHandler';
import { AppError } from './utils/AppError';

import { authMiddleware, optionalAuth } from './core/security/AuthMiddleware';
import { setupSwagger } from './core/docs/Swagger';

import authRoutes from './modules/auth/routes/AuthRoutes';
import userRoutes from './modules/user/routes/UserRoutes';
import websiteRoutes from './modules/website/routes/WebsiteRoutes';
import templateRoutes from './modules/website/routes/TemplateRoutes';
import paymentRoutes from './modules/payment/routes/PaymentRoutes';
import contactRoutes from './modules/contact/routes/ContactRoutes';
import adminRoutes from './modules/admin/routes/AdminRoutes';
import analyticsRoutes from './modules/analytics/routes/AnalyticsRoutes';
import notificationRoutes from './modules/notification/routes/NotificationRoutes';
import deploymentRoutes from './modules/deployment/routes/DeploymentRoutes';
import growthRoutes from './modules/growth/routes/GrowthRoutes';
import leadRoutes from './modules/lead/routes/LeadRoutes';
import customerRoutes from './modules/crm/routes/CustomerRoutes';
import chatbotRoutes from './modules/chatbot/routes/ChatbotRoutes';
import campaignRoutes from './modules/marketing/routes/MarketingRoutes';
import appointmentRoutes from './modules/booking/routes/BookingRoutes';
import aiRoutes from './modules/ai/routes/AIRoutes';

const app = express();

setupSwagger(app);

app.set('trust proxy', 1);

app.use(SecurityMiddleware.helmetConfig);
app.use(SecurityMiddleware.addSecurityHeaders);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: [clientUrl, ...(process.env.CORS_ORIGINS || '').split(',').filter(Boolean)],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
}));
app.use(compression());
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(SecurityMiddleware.mongoSanitize);
app.use(SecurityMiddleware.xssClean);
app.use(SecurityMiddleware.hppProtection);
app.use(optionalAuth);
app.use(SecurityMiddleware.requestLogger);
app.use('/api', SecurityMiddleware.csrfProtection);
app.use('/api', RateLimiter.global);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/websites/templates', templateRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/chatbots', chatbotRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LocalSite AI server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/admin/queues', authMiddleware, (req, _res, next) => {
  if ((req as any).user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
});
// BullBoard is mounted in server.ts after Redis check

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: SecurityMiddleware.generateCsrfToken(req, res) });
});

app.all('*', (req, _res, next) => {
  next(new AppError('Route ' + req.originalUrl + ' not found', 404));
});

app.use(errorHandler);

export default app;
