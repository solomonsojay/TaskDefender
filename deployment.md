# TaskDefender Deployment Guide

## Production Deployment

### Frontend Deployment (Netlify)

1. **Build the application**
```bash
npm run build
```

2. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

3. **Configure environment variables**
```bash
# In Netlify dashboard, add:
VITE_API_URL=https://api.taskdefender.com
VITE_APP_ENV=production
```

### Backend Deployment (Railway)

1. **Prepare for deployment**
```bash
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

2. **Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

3. **Configure environment variables**
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### Database Setup (PostgreSQL)

1. **Create database schema**
```sql
-- Run migration scripts
\i migrations/001_create_users.sql
\i migrations/002_create_tasks.sql
\i migrations/003_create_teams.sql
```

2. **Set up connection pooling**
```javascript
// Use connection pooling for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Docker Deployment

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/taskdefender
      - JWT_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=taskdefender
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Monitoring Setup

### Application Monitoring
```javascript
// Install Sentry for error tracking
npm install @sentry/react

// Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```javascript
// Install web vitals
npm install web-vitals

// Track performance metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Security Configuration

### HTTPS Setup
```nginx
server {
    listen 443 ssl http2;
    server_name taskdefender.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://taskdefender-backups/
```

### File Backups
```bash
# Backup user uploads
rsync -av /app/uploads/ s3://taskdefender-files/
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx/HAProxy)
- Implement session storage (Redis)
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Monitor CPU/memory usage
- Optimize database queries
- Implement caching layers
- Use compression