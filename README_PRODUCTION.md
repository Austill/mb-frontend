# SereniTree - Production Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Build Instructions](#build-instructions)
5. [Environment Configuration](#environment-configuration)
6. [Deployment](#deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)
11. [Security Best Practices](#security-best-practices)
12. [Backup & Recovery](#backup--recovery)
13. [Deployment Scripts](#deployment-scripts)
14. [Environment Setup](#environment-setup)

---

## Overview

**SereniTree** is a comprehensive mental health and wellness application built with modern web technologies. This guide covers production deployment and operations.

### Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.1.10
- **UI Components**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Query 5.83.0, React Hook Form 7.61.1
- **HTTP Client**: Axios 1.11.0
- **Charting**: Recharts 2.15.4
- **Routing**: React Router DOM 6.30.1
- **Theme Management**: Next Themes 0.3.0
- **Notifications**: Sonner 1.7.4

### Key Features

- 🎯 **Mood Tracking**: Daily mood logging with comprehensive analytics
- 📖 **Journal**: Personal journaling with advanced search and tagging
- 🧘 **Meditation**: Guided meditation sessions and breathing exercises
- 📊 **Progress Dashboard**: Visual analytics and mood trend analysis
- 💬 **AI Chat Widget**: Conversational AI support and insights
- 🆘 **Crisis Support**: Emergency resources and coping strategies
- 👑 **Premium Features**: Advanced analytics and exclusive content
- 🌓 **Theme Support**: Dark and light theme modes

---

## System Requirements

### Server Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or Bun v1.0.0+)
- **Memory**: Minimum 2GB RAM
- **Disk Space**: Minimum 500MB for dependencies and build artifacts
- **CPU**: Multi-core processor recommended for production builds

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 90+

### Supported Operating Systems

- Linux (Ubuntu 20.04 LTS or later)
- macOS (10.15 or later)
- Windows Server 2019 or later

---

## Pre-Deployment Checklist

### Code Quality Checks

- [ ] **Lint**: Run `npm run lint` and fix all issues
- [ ] **Type Checking**: Verify TypeScript compilation completes without errors
- [ ] **Build**: Test production build locally with `npm run build`
- [ ] **Code Review**: All changes reviewed and approved
- [ ] **Git Tags**: Create version tag (e.g., `v1.0.0`)

### Security Checks

- [ ] **Dependencies**: Run `npm audit` and resolve critical vulnerabilities
- [ ] **Secrets**: Ensure no hardcoded API keys or tokens in codebase
- [ ] **Environment**: All environment variables defined in `.env.production`
- [ ] **HTTPS**: SSL certificates configured and valid
- [ ] **CORS**: CORS policy properly configured for production domain

### Testing

- [ ] **Unit Tests**: All unit tests passing
- [ ] **Integration Tests**: Integration with backend verified
- [ ] **E2E Tests**: User flows tested in production-like environment
- [ ] **Performance**: Lighthouse score > 80
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified

### Documentation

- [ ] **API Documentation**: Backend API endpoints documented
- [ ] **Deployment Guide**: Updated and verified
- [ ] **Runbooks**: Created for common operations
- [ ] **Change Log**: Version history documented

---

## Build Instructions

### Local Development Build

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# Frontend will be available at http://localhost:8080
```

### Production Build

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build for production
npm run build
# Output: dist/ directory

# Preview production build locally
npm run preview
```

### Build Output Structure

```
dist/
├── index.html          # Main HTML entry point
├── assets/
│   ├── index-XXXXX.js  # Main JavaScript bundle
│   ├── index-XXXXX.css # Compiled styles
│   ├── serenity-tree.png
│   └── robots.txt
└── vite.svg
```

### Build Optimization Tips

- Use `npm run build -- --mode production` for optimized builds
- Build artifacts are minified and tree-shaken automatically by Vite
- Source maps are generated for production debugging
- All dynamic imports are code-split automatically

---

## Environment Configuration

### Environment Variables

Create a `.env.production` file in the project root:

```env
# API Configuration
VITE_API_URL=https://api.production.com
VITE_API_TIMEOUT=30000

# Application Settings
VITE_APP_NAME=SereniTree
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_PAYMENT_API_KEY=your_stripe_key_here
VITE_AI_SERVICE_URL=https://ai-service.production.com
```

### Critical Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.example.com` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_PAYMENT_API_KEY` | Payment processor key | *(secure value)* |
| `VITE_AI_SERVICE_URL` | AI service endpoint | `https://ai.example.com` |

### Build-Time Environment Variables

Environment variables are baked into the build and cannot be changed after deployment. To support multiple environments:

1. Create separate build commands:
   ```json
   "build:staging": "vite build --mode staging",
   "build:production": "vite build --mode production"
   ```

2. Create corresponding `.env.staging` and `.env.production` files

3. Build for each environment separately

---

## Deployment

### Option 1: Static Hosting (Recommended for Most Cases)

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { VITE_API_URL = "https://api.production.com" }
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(?!.*\\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$)",
      "destination": "/index.html"
    }
  ]
}
```

#### AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**AWS Configuration**:
- Enable versioning on S3 bucket
- Configure bucket for static website hosting
- Set CloudFront cache TTL to 1 year for immutable assets
- Set CloudFront cache TTL to 5 minutes for index.html

### Option 2: Docker Containerization

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  serenity-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=https://api.production.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# Build and run
docker-compose up -d
```

### Option 3: Node.js Server

```bash
# Install serve globally
npm install -g serve

# Build the project
npm run build

# Start production server
serve -s dist -l 3000
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Test main endpoint
curl https://your-production-url.com
# Expected: HTTP 200

# Test API connectivity
curl https://your-production-url.com/api/health
# Expected: JSON response

# Check bundle size
curl -I https://your-production-url.com/assets/index-*.js
# Expected: Reasonable file size
```

### Performance Verification

1. **Lighthouse Audit**
   ```bash
   # Using Lighthouse CLI
   npm install -g lighthouse
   lighthouse https://your-production-url.com --view
   ```

2. **WebPageTest**
   - Visit https://webpagetest.org
   - Test your production URL
   - Verify load time < 3 seconds

3. **Browser DevTools**
   - Open Chrome DevTools (F12)
   - Check Network tab for bundle sizes
   - Verify all assets load correctly

### Functional Testing

- [ ] Authentication flows (login/signup)
- [ ] Mood tracking submission
- [ ] Journal entry creation
- [ ] Navigation between tabs
- [ ] Theme switching
- [ ] API calls complete successfully
- [ ] Images load correctly (especially serenity-tree.png)
- [ ] No console errors

### Security Verification

```bash
# Check for mixed content warnings
curl -I https://your-production-url.com
# Verify: Strict-Transport-Security header present

# Test CORS headers
curl -H "Origin: https://example.com" -I https://your-production-url.com
# Verify: Appropriate CORS headers returned
```

---

## Monitoring & Maintenance

### Essential Monitoring

#### Error Tracking

Integrate error tracking service (e.g., Sentry):

```typescript
// src/main.tsx - Add at app initialization
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}
```

#### Analytics

Track user interactions and performance:

```typescript
// Example: Google Analytics integration
declare global {
  interface Window {
    gtag: Function;
  }
}

export const trackPageView = (path: string) => {
  window.gtag?.('config', 'GA_MEASUREMENT_ID', {
    page_path: path,
  });
};
```

#### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Pingdom](https://www.pingdom.com) - Advanced monitoring
- [DataDog](https://www.datadoghq.com) - Full observability platform

**Example Uptime Check Configuration**:
```
Service: SereniTree Frontend
URL: https://your-production-url.com
Check Interval: 5 minutes
Alert Recipients: ops-team@example.com
```

### Performance Monitoring

#### Web Vitals

Track Core Web Vitals:

```typescript
// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

#### Bundle Size Monitoring

```bash
# Check bundle size regularly
npm run build
# Note the bundle size from console output

# Compare with previous versions
# Alert if bundle size increases > 10%
```

### Log Aggregation

Recommended logging services:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog**
- **New Relic**
- **CloudWatch** (for AWS deployments)

---

## Troubleshooting

### Common Issues & Solutions

#### 1. White Screen on Production

**Symptoms**: App loads but shows blank screen

**Solutions**:
```bash
# Check browser console for errors
# Verify API_URL environment variable is correct
# Ensure dist/index.html exists
# Check CloudFront/CDN cache invalidation

# Inspect HTML
curl https://your-production-url.com | head -20
```

#### 2. Assets Not Loading (404 errors)

**Symptoms**: CSS/JS files not found, images missing

**Solutions**:
```bash
# Verify asset paths are correct
# Check vite.config.ts base path configuration
# Verify build output contains all assets

# For CDN/S3 deployment:
# - Check S3 bucket permissions
# - Verify CloudFront distribution points to correct origin
# - Check MIME types are set correctly (especially for fonts)
```

#### 3. API Connection Errors

**Symptoms**: `ERR_CONNECTION_REFUSED`, `CORS` errors

**Solutions**:
```bash
# Verify backend is running and accessible
curl https://api.production.com/health

# Check CORS headers from backend
curl -H "Origin: https://your-frontend-url" \
     -H "Access-Control-Request-Method: GET" \
     https://api.production.com/

# Verify environment variables are set correctly
# Look for VITE_API_URL in network tab requests
```

#### 4. Performance Issues

**Symptoms**: Slow page load, high Time to Interactive (TTI)

**Solutions**:
```bash
# Analyze bundle size
npm run build
# Check if bundle > 500KB (before gzip)

# Enable compression in web server
# Configure CDN caching properly
# Implement code splitting for routes

# Use Lighthouse to identify bottlenecks
lighthouse https://your-production-url.com --view
```

#### 5. Memory Leaks in Production

**Symptoms**: App becomes slow/unresponsive over time

**Solutions**:
```typescript
// In useEffect, always clean up:
useEffect(() => {
  const listener = () => {};
  window.addEventListener('resize', listener);
  
  return () => window.removeEventListener('resize', listener);
}, []);

// Clean up subscriptions
useEffect(() => {
  const subscription = observable.subscribe(...);
  return () => subscription.unsubscribe();
}, []);
```

---

## Performance Optimization

### Bundle Optimization

1. **Code Splitting**
   ```typescript
   // Lazy load components
   const Journal = lazy(() => import('@/components/journal/Journal'));
   
   <Suspense fallback={<LoadingSpinner />}>
     <Journal />
   </Suspense>
   ```

2. **Image Optimization**
   - Use WebP format for images
   - Compress images: `imagemin` or similar tools
   - Use responsive images: `srcset` attribute
   - For serenity-tree.png: Ensure optimized before deployment

   ```bash
   # Optimize images before deployment
   npx imagemin src/assets/*.png --out-dir=src/assets --plugin=pngquant
   ```

3. **Remove Unused Dependencies**
   ```bash
   # Analyze bundle composition
   npm run build -- --analyze
   ```

### Caching Strategy

**For Static Files** (JavaScript, CSS, images):
- Cache-Control: `public, max-age=31536000, immutable`
- Use content hash in filenames (Vite does this by default)

**For HTML**:
- Cache-Control: `public, max-age=300` (5 minutes)
- Enable ETag for change detection

**For API Responses**:
- Configure React Query cache settings
- Use appropriate stale time and garbage collection

### Network Optimization

```typescript
// Configure React Query for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### CSS Optimization

Tailwind CSS is already configured with:
- Purging unused styles in production
- Minification
- Critical CSS inlining

---

## Security Best Practices

### API Security

1. **Secure Headers**
   ```nginx
   # nginx configuration
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```

2. **HTTPS Only**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use valid SSL certificate (Let's Encrypt is free)

3. **Environment Variables**
   - Never commit `.env.production` to Git
   - Use secrets management (HashiCorp Vault, AWS Secrets Manager)
   - Rotate sensitive credentials regularly

### Content Security Policy (CSP)

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'wasm-unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' data:;
               connect-src 'self' https://api.production.com;">
```

### Input Validation

```typescript
// Always validate and sanitize user input
import DOMPurify from 'dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
```

### Dependency Security

```bash
# Regular dependency audits
npm audit

# Update dependencies safely
npm update

# Check for vulnerable packages
npm audit fix

# Use audit CI for automated checks
npm audit --audit-level=moderate
```

---

## Backup & Recovery

### Backup Strategy

1. **Database Backups** (if applicable)
   - Daily automated backups
   - Store in separate geographic region
   - Test restore procedures monthly

2. **Code Backups**
   - Use Git with multiple remotes
   - Tag production releases
   - Maintain release branches

3. **Configuration Backups**
   - Export environment variables
   - Save SSL certificates
   - Document deployment configuration

### Disaster Recovery Plan

**Recovery Time Objective (RTO)**: < 1 hour
**Recovery Point Objective (RPO)**: < 15 minutes

**Steps to Restore from Backup**:
1. Identify issue using logs/monitoring
2. Revert to previous stable build
3. Restore from backup if needed
4. Verify functionality
5. Update DNS if necessary
6. Document incident and actions taken

```bash
# Quick rollback procedure
git checkout v1.0.0  # Previous version tag
npm run build
# Deploy using your deployment method
```

---

## Deployment Checklist (Final)

- [ ] All security checks passed
- [ ] Build successfully completes
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Database migrations completed
- [ ] Backups in place
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Deployment runbook reviewed
- [ ] Rollback procedure tested
- [ ] Post-deployment tests passed
- [ ] Performance targets met
- [ ] All team members trained

---

## Support & Escalation

### Support Contacts

| Role | Contact | On-Call |
|------|---------|---------|
| DevOps | devops@example.com | Yes |
| Backend Lead | backend@example.com | Yes |
| Frontend Lead | frontend@example.com | Yes |
| Operations | ops@example.com | 24/7 |

### Escalation Process

1. **Tier 1** (0-5 min): On-call engineer investigates
2. **Tier 2** (5-15 min): Team lead involved
3. **Tier 3** (15+ min): Director notified, full team mobilized

### Incident Response

- Document incident details in ticket system
- Post updates to #incidents Slack channel
- Update status page
- Post-incident review within 24 hours

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Best Practices](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

## Deployment Scripts

### Automated Deployment Script

Create a `deploy.sh` script in the project root for automated deployments:

```bash
#!/bin/bash

# Deployment script for SereniTree
# Usage: ./deploy.sh [environment]

ENVIRONMENT=${1:-production}
BRANCH=${2:-main}

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "❌ Invalid environment. Use 'staging' or 'production'"
  exit 1
fi

# Check if branch exists
if ! git show-ref --verify --quiet refs/heads/$BRANCH; then
  echo "❌ Branch '$BRANCH' does not exist"
  exit 1
fi

# Switch to branch
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm run lint
npm run build

# Build for specific environment
echo "🔨 Building for $ENVIRONMENT..."
npm run build:$ENVIRONMENT

# Deploy based on environment
if [[ "$ENVIRONMENT" == "staging" ]]; then
  echo "📤 Deploying to staging..."
  # Add your staging deployment commands here
  # Example: netlify deploy --dir=dist --alias=$BRANCH
elif [[ "$ENVIRONMENT" == "production" ]]; then
  echo "📤 Deploying to production..."
  # Add your production deployment commands here
  # Example: netlify deploy --prod --dir=dist
fi

echo "✅ Deployment completed successfully!"
```

### Rollback Script

```bash
#!/bin/bash

# Rollback script for SereniTree
# Usage: ./rollback.sh [version]

VERSION=${1:-latest}

echo "🔄 Starting rollback to $VERSION..."

# Get previous deployment
if [[ "$VERSION" == "latest" ]]; then
  PREVIOUS_DEPLOY=$(git tag --sort=-version:refname | head -2 | tail -1)
else
  PREVIOUS_DEPLOY=$VERSION
fi

echo "Rolling back to: $PREVIOUS_DEPLOY"

# Checkout previous version
git checkout $PREVIOUS_DEPLOY

# Build and deploy
npm install
npm run build
# Add your deployment commands here

echo "✅ Rollback completed!"
```

### Health Check Script

```bash
#!/bin/bash

# Health check script for SereniTree
# Usage: ./health-check.sh [url]

URL=${1:-http://localhost:3000}

echo "🔍 Checking health of $URL..."

# Check if site is up
if curl -f -s "$URL" > /dev/null; then
  echo "✅ Site is responding"
else
  echo "❌ Site is not responding"
  exit 1
fi

# Check API connectivity
if curl -f -s "$URL/api/health" > /dev/null; then
  echo "✅ API is responding"
else
  echo "❌ API is not responding"
  exit 1
fi

# Check for console errors (requires puppeteer or similar)
echo "✅ All health checks passed!"
```

## Environment Setup

### Local Development Environment

1. **Prerequisites**
   ```bash
   # Install Node.js (v18+)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Git
   sudo apt-get install git

   # Install VS Code (optional)
   wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
   sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
   sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
   sudo apt-get install apt-transport-https
   sudo apt-get update
   sudo apt-get install code
   ```

2. **Project Setup**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/serenity-tree.git
   cd serenity-tree

   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env.local

   # Start development server
   npm run dev
   ```

3. **Environment Configuration**
   ```env
   # .env.local
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=SereniTree (Development)
   VITE_ENVIRONMENT=development
   VITE_ENABLE_DEBUG=true
   ```

### Production Environment Setup

1. **Server Setup**
   ```bash
   # Update system
   sudo apt-get update && sudo apt-get upgrade

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2

   # Install nginx
   sudo apt-get install nginx
   ```

2. **SSL Certificate Setup**
   ```bash
   # Install certbot for Let's Encrypt
   sudo apt-get install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/serenity-tree
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

4. **Firewall Configuration**
   ```bash
   # Configure UFW
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw --force enable
   ```

5. **Monitoring Setup**
   ```bash
   # Install monitoring tools
   sudo apt-get install htop iotop

   # Setup log rotation
   sudo nano /etc/logrotate.d/serenity-tree
   ```

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintained By**: Development Team
//

# Mind Buddy — Backend

A Flask-based backend for the Mind Buddy mental-wellness app. This repo provides REST endpoints for user authentication, journal and mood tracking, payments, and an AI-powered conversational assistant (Sereni) backed by the Groq LLM API.

This README covers: setup, environment variables, running locally, deployment notes (Render), common troubleshooting (CORS, LLM key), and a quick API reference.

## Table of contents
- Project overview
- Requirements
- Environment variables
- Quick start (Windows PowerShell)
- Running locally
- Tests (basic checks)
- Deployment notes (Render)
- API reference (key endpoints)
- Troubleshooting
- Security & secret handling
- Appendix: .env.example

## Project overview

The backend is a Flask application that exposes a set of REST endpoints under `/api/*`. Key features:
- User registration, login and JWT-based authentication
- Journals and mood entry endpoints
- Payment hooks and subscription handling
- AI chat powered by a Groq LLM (Sereni)
- Sentiment analysis integrations

Project layout (top-level, relevant paths):
- `backend/` — main Flask app
  - `backend/routes/` — route blueprints (auth, chat, ai_chat, journal, mood, payments, subscribe, user, webhook)
  - `backend/services/` — business logic services (LLM, sentiment, chat, payment integrations)
  - `backend/models/` — DB models
  - `backend/config.py` — configuration and environment loading
  - `backend/extensions.py` — Flask extensions (CORS, JWT, Bcrypt)
  - `backend/run.py` — local run entrypoint

## Requirements
- Python 3.10+ (use the version your environment supports)
- pip
- A MongoDB URI (Atlas recommended for production)
- Groq account and API key for AI features (if you plan to use AI chat)

Install dependencies (from repo root):

```powershell
# From the repository root (contains `backend/requirements.txt`)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

## Environment variables
The app reads env vars (via `python-dotenv` in `backend/config.py`). For production, set these in your hosting provider (Render) — do not commit secrets to the repo.

Important variables (add these to Render or a local `.env` during development):

- `SECRET_KEY` — Flask secret for JWT signing and session security.
- `MONGO_URI` — MongoDB connection string (Atlas recommended).
- `MONGODB_DB_NAME` — Name of the DB (default: `mindbuddy`).
- `GROQ_API_KEY` — Groq API key for LLM requests (REPLACE with your key). If not set, the AI endpoints will return a 503 and a helpful log will appear.
- `GROQ_MODEL` — (optional) model name to use (e.g. `llama-3.1-8b-instant`).
- `CORS_ORIGINS` — Comma-separated list of allowed origins for CORS (e.g. `https://mb-frontend-rho.vercel.app,http://localhost:3000`). Must include exact scheme (https://) for deployed frontends.
- `JWT_SECRET_KEY` — (optional) separate key for JWT; otherwise `SECRET_KEY` is used.
- `LOGGING_LEVEL` — DEBUG/INFO/WARNING (default INFO).
- `FLW_*` — Flutterwave payment keys (if you use payments): `FLW_SECRET_KEY`, `FLW_SIGNATURE_KEY`, `FLW_PLAN_ID`.

## Quick start — local development (Windows PowerShell)

1. Create and activate venv, install deps (see earlier code block).
2. Copy `.env.example` to `.env` and fill values (local values fine for dev):

```powershell
cp backend/.env.example backend/.env
# Edit backend/.env with your keys and MONGO_URI
notepad backend/.env
```

3. Run the app locally:

```powershell
# From repository root
python backend/run.py
# App will listen on http://0.0.0.0:5000
```

4. Verify basic health endpoint:

```powershell
curl -i http://localhost:5000/api/health
```

## Running tests / quick checks
This repo includes some lightweight test files (e.g., `test_server.py`). There is no full test harness configured by default. To run a simple server import check you can run:

```powershell
python -c "import backend; print('OK', backend)" 
```

## Deployment notes (Render)
Recommended: use Render's environment variables to set secrets and config. Key points:
- Add `GROQ_API_KEY`, `MONGO_URI`, `SECRET_KEY`, and `CORS_ORIGINS` in the Render service dashboard (Environment > Environment Variables).
- Ensure `CORS_ORIGINS` includes your production frontend URL with https, e.g. `https://mb-frontend-rho.vercel.app`.
- After updating env vars, redeploy or restart the service to pick up changes.

If the AI chat fails with 503 or the logs show `Failed to initialize LLMService`, it usually means `GROQ_API_KEY` is missing or invalid in the Render env.

### Recommended Render env example (single line):
```
GROQ_API_KEY=your_new_groq_key_here
CORS_ORIGINS=https://mb-frontend-rho.vercel.app
MONGO_URI=your_mongo_uri
SECRET_KEY=your_secret_key
LOGGING_LEVEL=INFO
```

## API reference — key endpoints
(Only high level; see `backend/routes/` for full details.)

Auth
- POST /api/auth/register — Register a new user
  - Body JSON: { firstName, lastName, email, password }
- POST /api/auth/login — Login
  - Body JSON: { email, password }
  - Response: { token, user }
- PUT /api/auth/change-password — (auth) Change password

AI Chat (Sereni)
- POST /api/chat/message — (auth) Send user message to AI
  - Body JSON: { message: "...", conversation_id: "optional" }
  - Requires Authorization: Bearer <JWT>
- GET /api/chat/conversations — (auth) Recent conversations
- GET /api/chat/conversation/<id> — (auth) Get a conversation
- GET /api/chat/history — (auth) All messages for user
- GET /api/chat/proactive-check-in — (auth) AI generated check-in

Other
- GET /api/health — Service health
- Various endpoints under `/api/journal`, `/api/user`, `/api/mood`, `/api/payments`, `/api` (subscribe, webhook) — see `backend/routes/` for details

### Example: login + chat (PowerShell curl)
```powershell
# Login to get JWT
$login = curl -s -X POST "https://<your-backend>/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'
# Extract token (quick, using jq would be nicer). If jq installed:
# $token = ($login | jq -r .token)

# Example POST message with token
curl -i -X POST "https://<your-backend>/api/chat/message" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <YOUR_JWT>" `
  -d '{"message":"Hello Sereni, how are you?"}'
```

> Note: the chat endpoint will return 503 if the Groq LLM client fails to initialize. Check server logs for `Failed to initialize LLMService` when diagnosing.

## Troubleshooting

CORS errors
- Symptom: browser console shows "No 'Access-Control-Allow-Origin' header is present" or preflight fails.
- Cause: the `Origin` header from your frontend did not match any entry in `CORS_ORIGINS`.
- Fix: set `CORS_ORIGINS` to include your frontend origin including scheme (e.g. `https://mb-frontend-rho.vercel.app`) in Render environment variables or your server environment. Avoid trailing commas.
- Debug tip: request the health endpoint with an Origin header and inspect headers:
```powershell
curl -i -H "Origin: https://mb-frontend-rho.vercel.app" https://<your-backend>/api/health
```

LLM / AI chat errors
- Symptom: POST `/api/chat/message` returns 500 or 503; logs show errors about Groq key or API.
- Cause: `GROQ_API_KEY` missing, invalid, or client cannot reach Groq.
- Fix: rotate/regenerate GROQ_API_KEY in provider dashboard, set `GROQ_API_KEY` in Render env, redeploy.
- Local check: ensure `backend/.env` (for local dev) contains `GROQ_API_KEY` (do not commit this file).

500 Internal Server Errors
- Check the server logs (Render dashboard logs or local console). The backend logs stack traces for exceptions. Look for `Chat message error` or `Login error` context.

JWT / Authentication
- Make sure you include `Authorization: Bearer <token>` header where endpoints are protected.

## Security & secrets
- DO NOT commit real secrets to git. If a secret was committed, rotate/revoke it immediately.
- To stop tracking a `.env` already committed:
```powershell
git rm --cached backend/.env
git commit -m "Stop tracking backend/.env (contains secrets)"
git push origin main
```
- Ensure `.gitignore` contains `.env` (this project includes .env in `.gitignore`).

## Appendix — recommended `backend/.env.example`
Copy this to `backend/.env` and fill values locally. Never commit actual keys.

```dotenv
# Flask
SECRET_KEY=replace_me_with_a_secret
LOGGING_LEVEL=DEBUG

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=mindbuddy

# LLM (Groq)
GROQ_API_KEY=replace_with_groq_key
GROQ_MODEL=llama-3.1-8b-instant

# CORS (comma separated)
CORS_ORIGINS=http://localhost:3000,https://mb-frontend-rho.vercel.app

# JWT
JWT_SECRET_KEY=replace_jwt_secret_if_needed

# Payments (optional)
FLW_SECRET_KEY=
FLW_SIGNATURE_KEY=
FLW_PLAN_ID=
REDIRECT_URL=
```

---

If you'd like, I can:
- Add a small `/api/ai_health` endpoint that returns LLM readiness (available/unavailable).
- Add startup logs that print `CORS_ORIGINS` at boot to make CORS troubleshooting easier.
- Create a `dev-instructions.md` with step-by-step screenshots for deploying to Render and Vercel.

If you want any of those, tell me which and I'll add them next.
