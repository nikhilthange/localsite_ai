import dotenv from 'dotenv';
dotenv.config();

function assertSecureConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const secrets: Record<string, string | undefined> = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    CSRF_SECRET: process.env.CSRF_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
  for (const [key, value] of Object.entries(secrets)) {
    if (!value || value.length < 16 || value.includes('change-in-production') || value.includes('your-')) {
      throw new Error(`Insecure/missing secret: ${key}. Set a strong, unique value (min 16 chars) in production.`);
    }
  }
}
assertSecureConfig();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/localsite-ai',
    options: {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10),
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    prefix: process.env.REDIS_PREFIX || 'localsite:',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-jwt-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  auth: {
    cookieSecret: process.env.COOKIE_SECRET || 'dev-cookie-secret',
    csrfSecret: process.env.CSRF_SECRET || 'dev-csrf-secret',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@localsiteai.com',
    fromName: process.env.EMAIL_FROM_NAME || 'LocalSite AI',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || 'localsite-ai-assets',
  },

  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
    domain: process.env.CLOUDFLARE_DOMAIN || '',
    r2Bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
    name: process.env.APP_NAME || 'LocalSite AI',
  },

  app: {
    name: process.env.APP_NAME || 'LocalSite AI',
    url: process.env.APP_URL || 'http://localhost:5000',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@localsiteai.com',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    googleOAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
  },

  bullmq: {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    },
  },
};

export default config;
