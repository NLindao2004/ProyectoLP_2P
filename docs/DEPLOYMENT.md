# Deployment Guide - Terraverde Project

## Overview
Esta guía cubre el despliegue completo de la plataforma Terraverde en diferentes ambientes: desarrollo, staging y producción.

## Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Firebase      │
│   (Angular)     │◄──►│   (PHP/API)     │◄──►│   (Database)    │
│   Port: 4200    │    │   Port: 8000    │    │   Cloud         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **Node.js**: 18.x or later
- **PHP**: 8.2 or later
- **Composer**: 2.x
- **Git**: Latest version
- **Web Server**: Apache/Nginx (production)

### Required Accounts
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps API](https://developers.google.com/maps)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/terraverde.git
cd terraverde
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Install Angular CLI globally if not installed
npm install -g @angular/cli

# Start development server
ng serve
# Access: http://localhost:4200
```

### 3. Backend Setup
```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Start PHP development server
php -S localhost:8000 -t public
# Access: http://localhost:8000
```

### 4. Firebase Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

## Environment Configuration

### Frontend Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  firebase: {
    apiKey: "your-api-key",
    authDomain: "terraverde-dev.firebaseapp.com",
    projectId: "terraverde-dev",
    storageBucket: "terraverde-dev.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  },
  googleMaps: {
    apiKey: "your-google-maps-api-key"
  }
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.terraverde.com/api',
  firebase: {
    apiKey: "your-prod-api-key",
    authDomain: "terraverde-prod.firebaseapp.com",
    projectId: "terraverde-prod",
    storageBucket: "terraverde-prod.appspot.com",
    messagingSenderId: "987654321",
    appId: "1:987654321:web:fedcba654321"
  },
  googleMaps: {
    apiKey: "your-prod-google-maps-api-key"
  }
};
```

### Backend Environment
```bash
# .env
APP_NAME=Terraverde
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.terraverde.com

# Database Configuration
DB_CONNECTION=firebase
FIREBASE_PROJECT_ID=terraverde-prod
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@terraverde-prod.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40terraverde-prod.iam.gserviceaccount.com

# Storage Configuration
FIREBASE_STORAGE_BUCKET=terraverde-prod.appspot.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://terraverde.com,https://www.terraverde.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# Google Maps
GOOGLE_MAPS_API_KEY=your-server-side-maps-api-key

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRATION=3600

# Mail Configuration (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@terraverde.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@terraverde.com
MAIL_FROM_NAME="Terraverde"
```

## Production Deployment

### Option 1: Traditional Hosting (Apache/Nginx)

#### Frontend Deployment
```bash
# Build for production
ng build --configuration=production

# The dist/ folder contains the built application
# Upload contents to your web server document root
```

#### Apache Configuration
```apache
# .htaccess in document root
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Handle client-side routing
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  
  # Security headers
  Header always set X-Frame-Options DENY
  Header always set X-Content-Type-Options nosniff
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  
  # Compression
  <IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
  </IfModule>
</IfModule>
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name terraverde.com www.terraverde.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name terraverde.com www.terraverde.com;
    
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    root /var/www/terraverde/public;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy (if backend is on same server)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Backend Deployment
```bash
# Upload backend files to server
# Install dependencies
composer install --no-dev --optimize-autoloader

# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache

# Create symbolic link to public folder
ln -s /path/to/backend/public /var/www/api.terraverde.com
```

### Option 2: Docker Deployment

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/var/www/html
      - ./backend/storage:/var/www/html/storage
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    env_file:
      - ./backend/.env

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist/terraverde-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM php:8.2-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer*.json ./
RUN composer install --no-dev --optimize-autoloader

COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage
RUN chmod -R 755 /var/www/html/storage

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
```

### Option 3: Cloud Deployment (Firebase Hosting + Cloud Run)

#### Firebase Hosting Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy frontend
ng build --prod
firebase deploy --only hosting
```

#### Firebase Hosting Configuration
```json
{
  "hosting": {
    "public": "dist/terraverde-frontend",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "terraverde-backend"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Cloud Run Deployment
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/terraverde-backend', './backend']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/terraverde-backend']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'terraverde-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/terraverde-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d terraverde.com -d www.terraverde.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate
```nginx
# nginx ssl configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Monitoring and Logging

### Application Monitoring
```php
// backend/src/Middleware/MonitoringMiddleware.php
class MonitoringMiddleware
{
    public function handle($request, $next)
    {
        $start = microtime(true);
        
        $response = $next($request);
        
        $duration = microtime(true) - $start;
        
        // Log performance metrics
        error_log(json_encode([
            'endpoint' => $request->getPathInfo(),
            'method' => $request->getMethod(),
            'duration' => $duration,
            'status' => $response->getStatusCode(),
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        
        return $response;
    }
}
```

### Frontend Error Monitoring
```typescript
// src/app/services/error-handler.service.ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error:', error);
    
    // Send to monitoring service
    if (environment.production) {
      this.sendToMonitoring(error);
    }
  }
  
  private sendToMonitoring(error: any): void {
    // Implement error reporting to service like Sentry
    // Sentry.captureException(error);
  }
}
```

### Log Rotation
```bash
# /etc/logrotate.d/terraverde
/var/log/terraverde/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

## Database Backup

### Firebase Backup Script
```bash
#!/bin/bash
# backup-firebase.sh

PROJECT_ID="terraverde-prod"
BACKUP_BUCKET="terraverde-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Export Firestore data
gcloud firestore export gs://$BACKUP_BUCKET/firestore-backup-$DATE \
    --project=$PROJECT_ID

# Export Firebase Storage
gsutil -m cp -r gs://terraverde-prod.appspot.com gs://$BACKUP_BUCKET/storage-backup-$DATE/

echo "Backup completed: $DATE"
```

### Automated Backup
```bash
# Add to crontab
0 2 * * * /path/to/backup-firebase.sh >> /var/log/backup.log 2>&1
```

## Performance Optimization

### Frontend Optimization
```typescript
// Lazy loading modules
const routes: Routes = [
  {
    path: 'catalog',
    loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)
  }
];
```

### Backend Optimization
```php
// Add response caching
class CacheMiddleware
{
    public function handle($request, $next)
    {
        $key = 'api_' . md5($request->getPathInfo() . serialize($request->query->all()));
        
        if ($cached = $this->cache->get($key)) {
            return new JsonResponse($cached);
        }
        
        $response = $next($request);
        
        if ($response->getStatusCode() === 200) {
            $this->cache->set($key, $response->getContent(), 300); // 5 minutes
        }
        
        return $response;
    }
}
```

## Security Checklist

### Frontend Security
- [ ] Content Security Policy (CSP) configured
- [ ] XSS protection enabled
- [ ] HTTPS redirect enforced
- [ ] Sensitive data not in localStorage
- [ ] API keys properly configured for domain restrictions

### Backend Security
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Proper CORS configuration
- [ ] JWT tokens securely handled
- [ ] File upload restrictions

### Infrastructure Security
- [ ] Firewall properly configured
- [ ] SSH keys instead of passwords
- [ ] Regular security updates
- [ ] Log monitoring
- [ ] Backup encryption

## Troubleshooting

### Common Issues

#### Frontend Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Memory issues during build
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod
```

#### Backend API Issues
```bash
# Check PHP error logs
tail -f /var/log/php_errors.log

# Verify permissions
ls -la storage/
ls -la bootstrap/cache/

# Test API directly
curl -X GET http://localhost:8000/api/health
```

#### Firebase Connection Issues
```bash
# Test Firebase credentials
firebase projects:list

# Verify service account permissions
gcloud iam service-accounts get-iam-policy [SERVICE_ACCOUNT_EMAIL]
```

### Health Check Endpoints

#### Frontend Health Check
```typescript
// src/app/services/health.service.ts
@Injectable()
export class HealthService {
  checkHealth(): Observable<any> {
    return this.http.get('/api/health').pipe(
      timeout(5000),
      catchError(error => of({ status: 'ERROR', error }))
    );
  }
}
```

#### Backend Health Check
```php
// backend/src/Controllers/HealthController.php
class HealthController
{
    public function check()
    {
        $checks = [
            'api' => 'OK',
            'database' => $this->checkDatabase(),
            'storage' => $this->checkStorage(),
            'timestamp' => date('c')
        ];
        
        $status = array_reduce($checks, function($carry, $check) {
            return $carry && ($check === 'OK');
        }, true) ? 'OK' : 'ERROR';
        
        return [
            'status' => $status,
            'checks' => $checks,
            'version' => '1.0.0'
        ];
    }
}
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Database backups created
- [ ] DNS records configured

### Deployment
- [ ] Frontend built and deployed
- [ ] Backend deployed and configured
- [ ] Database migrations run
- [ ] Cache cleared
- [ ] Services restarted

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Log files being written
- [ ] Performance metrics normal
- [ ] User acceptance testing completed

This deployment guide provides comprehensive instructions for deploying Terraverde in production environments with proper security, monitoring, and maintenance procedures.
