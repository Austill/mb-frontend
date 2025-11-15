# SereniTree - Production Deployment & Operations Guide

**Version**: 1.0  
**Last Updated**: November 15, 2025  
**Application**: SereniTree Mental Health & Wellness Platform (Frontend)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Environment Configuration](#environment-configuration)
5. [Build & Deployment](#build--deployment)
6. [Infrastructure Setup](#infrastructure-setup)
7. [Performance Optimization](#performance-optimization)
8. [Security Best Practices](#security-best-practices)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)
11. [Backup & Disaster Recovery](#backup--disaster-recovery)
12. [FAQs](#faqs)

---

## 📖 Overview

**SereniTree** is a comprehensive mental health and wellness application built with modern web technologies. The frontend is a React + TypeScript + Vite application that provides:

- **Mood Tracking**: Daily mood logging and history
- **Journaling**: Secure entry creation and management
- **Meditation**: Guided meditation sessions
- **Crisis Support**: Emergency resources and contacts
- **Progress Dashboard**: Analytics and insights
- **Premium Features**: Advanced tools for subscribers
- **User Settings**: Preferences, profile, and account management

### Key Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 7.1.10 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | Radix UI + shadcn/ui | Latest |
| Routing | React Router | 6.30.1 |
| HTTP Client | Axios | 1.11.0 |
| State Management | React Query | 5.83.0 |
| Icons | Lucide React | 0.462.0 |
| Charts | Recharts | 2.15.4 |
| Forms | React Hook Form | 7.61.1 |
| Notifications | Sonner | 1.7.4 |

---

## 🖥️ System Requirements

### Minimum Server Requirements (Production)

- **CPU**: 2+ cores (4 cores recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 500MB for application + 1GB for logs and cache
- **Node.js**: 18+ (20+ recommended)
- **npm/yarn**: 8+ or Bun
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows Server

### Recommended Stack

- **Node.js**: 20.x LTS
- **Package Manager**: Bun or npm 10+
- **Reverse Proxy**: Nginx 1.25+
- **SSL/TLS**: Let's Encrypt or managed certificate service
- **Database Backend**: Connected to Python/Flask backend (port 5000)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing: `npm run lint`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Code review completed
- [ ] Security audit completed (OWASP guidelines)
- [ ] Dependencies up-to-date and audited: `npm audit`

### Configuration
- [ ] Environment variables defined and validated
- [ ] API endpoints configured correctly
- [ ] Backend service is running and accessible
- [ ] CORS headers properly configured on backend
- [ ] SSL/TLS certificates obtained

### Branding & Assets
- [ ] SereniTree logo (serenity-tree.png) verified in public folder
- [ ] Favicon correctly set in index.html
- [ ] No placeholder or "leaf" references remaining
- [ ] All brand colors applied correctly
- [ ] Meta tags and OG tags updated

### Monitoring & Logging
- [ ] Error tracking service configured (e.g., Sentry)
- [ ] Analytics configured (Google Analytics or similar)
- [ ] Log aggregation setup (e.g., ELK stack, CloudWatch)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring service configured

---

## 🔧 Environment Configuration

### Environment Variables

Create a `.env.production` file in the project root with the following configuration:

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000

# Authentication (if applicable)
VITE_AUTH_ENABLED=true
VITE_JWT_EXPIRY=3600

# Analytics
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
VITE_ENABLE_PREMIUM=true
VITE_ENABLE_CRISIS_SUPPORT=true
VITE_ENABLE_MEDITATION=true
VITE_ENABLE_JOURNAL=true

# Application
VITE_APP_NAME=SereniTree
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Session Management
VITE_SESSION_TIMEOUT=1800000
VITE_REMEMBER_ME_DURATION=604800000
```

### Backend API Configuration

Ensure the backend service is:
- Running on port 5000 (or configure `VITE_API_URL` accordingly)
- Accessible from the frontend domain
- Protected with CORS headers allowing your frontend domain
- Running with production-grade error handling and logging

### SSL/TLS Configuration

```nginx
# Example Nginx configuration for HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/serenity-tree/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🚀 Build & Deployment

### Building for Production

```bash
# Install dependencies (if not already installed)
npm install

# Build the application
npm run build

# (Optional) Test the build locally
npm run preview
```

The production build will be created in the `dist/` directory.

### Deployment Process

#### Option 1: Manual Deployment

```bash
# 1. Build locally
npm run build

# 2. Upload dist folder to server
scp -r dist/* user@server:/var/www/serenity-tree/

# 3. Restart web server
ssh user@server 'sudo systemctl restart nginx'
```

#### Option 2: CI/CD Pipeline (GitHub Actions Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run linter
      run: npm run lint
    
    - name: Build application
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.PROD_API_URL }}
        VITE_GA_ID: ${{ secrets.PROD_GA_ID }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /var/www/serenity-tree
          rm -rf dist
          mkdir -p dist
    
    - name: Upload build artifacts
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        source: "dist/*"
        target: "/var/www/serenity-tree"
    
    - name: Restart service
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: sudo systemctl restart nginx
```

#### Option 3: Docker Deployment

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:

```bash
docker build -t serenity-tree:latest .
docker run -p 3000:3000 \
  -e VITE_API_URL=https://api.yourdomain.com \
  serenity-tree:latest
```

---

## 🏗️ Infrastructure Setup

### Server Setup (Ubuntu 20.04+)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx

# 4. Create application directory
sudo mkdir -p /var/www/serenity-tree
sudo chown -R $USER:$USER /var/www/serenity-tree

# 5. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/serenity-tree
sudo ln -s /etc/nginx/sites-available/serenity-tree /etc/nginx/sites-enabled/

# 6. Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 7. Setup SSL certificates (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### Application Deployment

```bash
# 1. Clone or download repository
cd /var/www/serenity-tree
git clone <repo-url> .

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Configure environment
cp .env.example .env.production
# Edit .env.production with your values
```

---

## ⚡ Performance Optimization

### Build Optimization

The Vite configuration already includes optimizations:
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code removal
- **Minification**: Production minification enabled
- **Asset Optimization**: Image and font compression

### Runtime Optimization

```typescript
// React.lazy() for route-based code splitting
import { lazy, Suspense } from 'react';

const MoodTracker = lazy(() => import('@/components/mood/MoodTracker'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MoodTracker />
    </Suspense>
  );
}
```

### Nginx Caching Configuration

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Cache HTML for 1 hour
location = /index.html {
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
gzip_min_length 1024;
```

### CDN Setup

For global distribution, configure a CDN (Cloudflare, AWS CloudFront, etc.):

```env
# CloudFlare example
VITE_CDN_URL=https://cdn.yourdomain.com

# In your Vite config:
base: process.env.VITE_CDN_URL || '/'
```

---

## 🔒 Security Best Practices

### Content Security Policy (CSP)

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com;" always;
```

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### API Security

- **HTTPS Only**: Use TLS 1.2+ for all communications
- **CORS**: Restrict to trusted domains only
- **CSRF Protection**: Implement token-based CSRF protection on backend
- **Rate Limiting**: Configure rate limiting on backend API
- **Input Validation**: Sanitize all user inputs on backend
- **Authentication**: Use secure JWT tokens with proper expiration

### Client-Side Security

```typescript
// Secure localStorage usage (tokens)
const saveToken = (token: string) => {
  localStorage.setItem('token', token);
  // Consider using httpOnly cookies for better security
};

// Sanitize user input
const sanitizeInput = (input: string) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};
```

---

## 📊 Monitoring & Logging

### Error Tracking (Sentry Example)

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export default Sentry.withProfiler(App);
```

### Analytics (Google Analytics Example)

```typescript
import { useEffect } from 'react';

export const useAnalytics = () => {
  useEffect(() => {
    window.gtag('config', process.env.VITE_GA_ID);
  }, []);
};
```

### Application Logs

Configure logging on the backend to capture:
- User actions (login, logout, actions)
- API requests and responses
- Error events with stack traces
- Performance metrics
- System health

### Health Check Endpoint

The frontend should expose a health check:

```bash
# Test endpoint availability
curl https://yourdomain.com/
# Should return 200 OK and render HTML
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: White Blank Page

**Cause**: Build not served correctly or index.html missing

**Solution**:
```bash
# Verify dist folder exists
ls -la dist/

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Issue: API Connection Errors

**Cause**: Backend unreachable or CORS misconfigured

**Solution**:
```bash
# Test backend connectivity
curl https://api.yourdomain.com/health

# Check CORS headers from backend
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     https://api.yourdomain.com/api/mood -v
```

#### Issue: Infinite Loading / Token Expired

**Cause**: Auth token expired or invalid

**Solution**:
1. Clear browser cache and localStorage
2. Log out and log in again
3. Check token expiration in `.env.production`
4. Verify backend token validation logic

#### Issue: Performance Degradation

**Cause**: Large bundle size, missing caching, or database slowness

**Solution**:
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build -- --analyze

# Enable Nginx caching (see Performance Optimization section)

# Check backend performance
curl -w "@curl-format.txt" https://api.yourdomain.com/api/mood
```

#### Issue: Browser Cache Not Clearing After Update

**Solution**: Vite automatically generates cache-busting hashes for files. Ensure:
```nginx
# Don't cache the HTML file
location = /index.html {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 💾 Backup & Disaster Recovery

### Data Backup Strategy

1. **User Data** (Backend responsibility): Daily backups to secure storage
2. **Application Code**: Regular git commits and tags
3. **Configuration**: Backup `.env.production` file securely

### Disaster Recovery Procedure

```bash
# 1. Clone repository on new server
git clone <repo-url> /var/www/serenity-tree

# 2. Install dependencies
cd /var/www/serenity-tree
npm install

# 3. Restore environment configuration
# Copy backed-up .env.production file

# 4. Build application
npm run build

# 5. Verify deployment
curl https://yourdomain.com/

# 6. Monitor logs for errors
tail -f /var/log/nginx/access.log
```

---

## ❓ FAQs

### Q: How do I update the application?

A: Push updates to your git repository and trigger the CI/CD pipeline:
```bash
git commit -am "Update feature X"
git push origin main
# CI/CD automatically builds and deploys
```

### Q: How do I rollback to a previous version?

A: Use git tags for versioning:
```bash
# Tag a release
git tag -a v1.0.0 -m "Production Release v1.0.0"

# Rollback to previous tag
git checkout v1.0.0
npm run build
# Redeploy
```

### Q: Can I run multiple instances for load balancing?

A: Yes! Use Nginx as a reverse proxy:
```nginx
upstream serenity_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://serenity_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Q: What's the expected time for a deployment?

A: Typically 5-10 minutes depending on:
- Build time (usually 1-2 minutes)
- File transfer time (depends on size and connection)
- Service restart time (typically 30 seconds)

### Q: How do I monitor application health?

A: Configure:
1. **Uptime monitoring**: Pingdom, StatusCake, or similar
2. **Error tracking**: Sentry for exception monitoring
3. **Performance monitoring**: Datadog, New Relic, or similar
4. **Log aggregation**: ELK stack, Splunk, or CloudWatch

### Q: Is the application mobile-friendly?

A: Yes! SereniTree is fully responsive with Tailwind CSS breakpoints. Test with:
```bash
npm run dev
# Open in mobile device on same network
# Visit http://<your-ip>:8080
```

### Q: How do I enable HTTPS?

A: Use Let's Encrypt (free) or a commercial certificate provider:
```bash
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot renew --dry-run  # Test auto-renewal
```

---

## 📞 Support & Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See `README_SETUP.md` for development setup
- **Commits**: Check `FRONTEND_FIXES.md` for recent changes
- **Backend**: Ensure backend service is running and healthy

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-15 | Initial production release |
| - | - | - |

---

## 📄 License & Ownership

**SereniTree** - Mental Health & Wellness Application  
**Author**: SereniTree Team  
**Year**: 2025

---

**Last Updated**: November 15, 2025  
**Status**: ✅ Production Ready
