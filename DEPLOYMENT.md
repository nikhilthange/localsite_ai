# LocalSite AI - Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose
- Git
- AWS Account (for production)
- Vercel Account (for frontend)

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/localsite?retryWrites=true&w=majority

# Redis
REDIS_URL=redis://:password@localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# OpenAI
OPENAI_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@localsite.ai

# SMTP (fallback)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=...

# Frontend
FRONTEND_URL=http://localhost:5173

# API URL
API_URL=http://localhost:5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_KEY=pk_test_...
VITE_RAZORPAY_KEY=rzp_test_...
VITE_GOOGLE_CLIENT_ID=...
VITE_GA_ID=G-XXXXXXXXXX
VITE_SITE_URL=http://localhost:5173
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker Deployment

### Build & Run
```bash
cd docker
docker-compose up -d --build
```

### Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Nginx**: http://localhost:80

## Production Deployment (AWS EC2)

### 1. Provision EC2 Instance
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
```

### 2. Clone & Configure
```bash
git clone https://github.com/yourusername/localsite-ai.git
cd localsite-ai
cp docker/.env.example docker/.env
# Edit .env with production values
```

### 3. Deploy
```bash
cd docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. SSL Certificate
```bash
sudo certbot --nginx -d localsite.ai -d api.localsite.ai
```

### 5. CI/CD Pipeline (GitHub Actions)
The `.github/workflows/ci-cd.yml` automatically:
1. Runs tests on push/PR to main
2. Builds Docker images
3. Deploys to EC2 via SSH
4. Runs database migrations

## Vercel Deployment (Frontend)

### 1. Connect Repository
- Go to vercel.com
- Import GitHub repository
- Set framework to Vite
- Add environment variables

### 2. Build Settings
```bash
# Build command
cd frontend && npm run build

# Output directory
frontend/dist
```

## MongoDB Atlas Setup

1. Create cluster (M10 or higher for production)
2. Enable IP whitelist (include EC2 IP)
3. Create database user
4. Get connection string

## Monitoring & Logging

### Backend Logs
```bash
docker-compose logs -f backend
```

### Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### Application Monitoring
- MongoDB Atlas monitoring dashboard
- Redis Insights
- Sentry for error tracking
- Datadog/New Relic for APM

## Backup Strategy

### Database
```bash
# Automated daily backup via cron
0 2 * * * docker exec mongodb mongodump --out /backups/$(date +\%Y-\%m-\%d)
```

### File Storage
- AWS S3 bucket for user uploads
- 30-day retention for backups

## Scaling

### Horizontal Scaling
- Add EC2 instances behind ALB
- Use Redis for session sharing
- Enable MongoDB sharding for large datasets

### Vertical Scaling
- Upgrade EC2 instance type
- Increase MongoDB Atlas cluster tier
- Add more Redis memory

## Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# MongoDB connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis connection
docker exec redis redis-cli ping
```

## Troubleshooting

### Common Issues

1. **MongoDB connection refused**
   - Check MongoDB is running: `docker ps | grep mongo`
   - Verify connection string in .env

2. **JWT errors**
   - Ensure JWT_SECRET is set
   - Check token expiry

3. **OpenAI API errors**
   - Verify OPENAI_API_KEY is valid
   - Check API quota limits

4. **Email not sending**
   - Check SendGrid API key
   - Verify sender email is verified

5. **Docker container crashes**
   ```bash
   docker logs <container-name>
   docker-compose restart <service>
   ```
