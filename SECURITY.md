# Security Implementation Guide

## Overview

This document details all security measures implemented in the Todo application to protect against common web vulnerabilities and attacks.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [XSS Prevention](#xss-prevention)
3. [CSRF Protection](#csrf-protection)
4. [SQL/NoSQL Injection Prevention](#sqlnosql-injection-prevention)
5. [Rate Limiting](#rate-limiting)
6. [File Upload Security](#file-upload-security)
7. [Password Security](#password-security)
8. [Session Management](#session-management)
9. [Security Headers](#security-headers)
10. [API Security](#api-security)
11. [Deployment Security](#deployment-security)

---

## Authentication & Authorization

### JWT Token Security

**Backend Implementation:**
- Location: `backend/src/middleware/auth.middleware.js`
- Token validation on every protected route
- Comprehensive security logging for auth events
- Token expiration checking
- User validation after token decode

**Features:**
```javascript
- JWT_SECRET must be strong (32+ characters)
- Token expiration: 24 hours (configurable)
- Refresh token mechanism
- Token blacklist for logout
- Security event logging (LOGIN_SUCCESS, AUTH_FAILED, etc.)
```

**Frontend Implementation:**
- Location: `frontend/src/utils/secureStorage.js`
- Encrypted token storage
- Automatic token expiration
- Inactivity timeout (2 hours)
- Session extension on activity

### Account Lockout

**Implementation:** `backend/src/middleware/security.middleware.js`

- **Failed Login Tracking:** 5 failed attempts = 15-minute lockout
- **IP-based tracking:** Prevents brute force attacks
- **Automatic unlock:** After lockout period expires
- **Security logging:** All failed attempts logged

```javascript
// Usage in routes
router.post('/login', 
  authRateLimiter,          // Rate limit: 5 requests per 15 minutes
  checkAccountLockout,      // Check if account is locked
  sanitizeInput,            // Sanitize input
  login                     // Controller
);
```

---

## XSS Prevention

### Input Sanitization

**Backend:** `backend/src/middleware/security.middleware.js`
```javascript
// Sanitizes all request body and query parameters
// Removes <script> tags and dangerous HTML
app.use(sanitizeInput);
```

**Frontend:** `frontend/src/utils/xssProtection.js`
```javascript
import { sanitizeText, sanitizeHTML, sanitizeURL } from './utils/xssProtection';

// Sanitize plain text
const cleanText = sanitizeText(userInput);

// Sanitize HTML (for rich text editors)
const cleanHTML = sanitizeHTML(userHTML);

// Sanitize URLs
const cleanURL = sanitizeURL(userURL);
```

### Safe Component Rendering

```jsx
import { SafeHTML } from './utils/xssProtection';

// Render user-generated HTML safely
<SafeHTML html={userContent} className="user-content" />
```

### Content Security Policy

**Backend:** `backend/src/server.js`
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  }
}));
```

---

## CSRF Protection

### Implementation

**Backend:** `backend/src/middleware/security.middleware.js`

- CSRF token generation endpoint: `GET /api/auth/csrf-token`
- Token validation middleware: `verifyCsrfToken`
- Session-based token storage
- Automatic token refresh

**Frontend:** `frontend/src/api/client.js`

```javascript
// CSRF token automatically added to all state-changing requests
// POST, PUT, DELETE, PATCH requests include X-CSRF-Token header
```

### Usage

```javascript
// Backend route protection
router.post('/create', 
  verifyCsrfToken,  // Verify CSRF token
  authenticate,     // Verify JWT
  createController
);

// Frontend automatic handling
// No manual intervention needed - handled by axios interceptor
```

---

## SQL/NoSQL Injection Prevention

### Mongoose Query Sanitization

**Implementation:** `backend/src/middleware/security.middleware.js`

```javascript
// Prevents NoSQL injection attacks
app.use(preventNoSQLInjection);
app.use(mongoSanitize());
```

### Safe Query Patterns

```javascript
// ✅ SAFE - Using Mongoose query builders
await User.findOne({ email: userEmail });

// ✅ SAFE - Using Mongoose operators
await Todo.find({ userId: req.user._id });

// ❌ UNSAFE - Raw queries (avoid)
await db.collection.findOne({ $where: userInput });
```

### Input Validation

**Backend:** All routes use `express-validator`

```javascript
import { body, param, query } from 'express-validator';

const createTodoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .escape()
];
```

---

## Rate Limiting

### Implementation Layers

**1. Authentication Endpoints** (Strict)
```javascript
// 5 requests per 15 minutes
authRateLimiter
```

**2. API Endpoints** (Standard)
```javascript
// 100 requests per 15 minutes
apiRateLimiter
```

**3. File Upload** (Very Strict)
```javascript
// 10 requests per hour
uploadRateLimiter
```

### Configuration

Location: `backend/src/middleware/security.middleware.js`

```javascript
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      securityLogger(req, 'RATE_LIMIT_EXCEEDED', {
        endpoint: req.path,
        limit: max,
        window: windowMs
      });
      res.status(429).json({
        success: false,
        message
      });
    }
  });
};
```

### Distributed Rate Limiting (Production)

For production with multiple servers, use Redis:

```javascript
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

---

## File Upload Security

### Implementation

**Location:** `backend/src/config/upload.js`

### Security Measures

1. **File Size Limits**
```javascript
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 5
}
```

2. **MIME Type Validation**
```javascript
const allowedTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};
```

3. **Extension Validation**
```javascript
// Verify MIME type matches file extension
const fileExtension = path.extname(file.originalname).toLowerCase();
if (!validExtensions.includes(fileExtension)) {
  return cb(new Error('Invalid file extension'));
}
```

4. **Path Traversal Prevention**
```javascript
// Use only the basename, ignore any directory paths
const filename = path.basename(file.originalname);
```

5. **File Content Scanning** (Production Recommendation)
```javascript
// Install ClamAV for virus scanning
npm install clamscan

// Scan uploaded files
const clamscan = new NodeClam().init(options);
await clamscan.scanFile(filePath);
```

### Usage in Routes

```javascript
import { uploadRateLimiter, validateFileUpload } from '../middleware/security.middleware';

router.post('/upload',
  uploadRateLimiter,           // 10 uploads per hour
  authenticate,                // Verify user
  upload.single('file'),       // Multer upload
  validateFileUpload,          // Validate file
  uploadController             // Process upload
);
```

---

## Password Security

### Password Requirements

**Implementation:** `backend/src/middleware/security.middleware.js`

```javascript
const passwordStrengthValidator = (req, res, next) => {
  const { password } = req.body;
  
  // Requirements:
  // - Minimum 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character (@$!%*?&)
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
    });
  }
  
  next();
};
```

### Password Hashing

**Implementation:** `backend/src/models/User.model.js`

```javascript
import bcrypt from 'bcryptjs';

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Use 12 rounds in production for stronger security
  const rounds = process.env.NODE_ENV === 'production' ? 12 : 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Frontend Password Validation

**Implementation:** `frontend/src/utils/secureStorage.js`

```javascript
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordStrength = (password) => {
  // Returns: { strength: 'weak|medium|strong', score: 0-6, checks: {...} }
};
```

---

## Session Management

### Token Storage

**Frontend:** `frontend/src/utils/secureStorage.js`

Features:
- ✅ Obfuscated token storage (better than plain text)
- ✅ Automatic expiration (24 hours)
- ✅ Inactivity timeout (2 hours)
- ✅ Session extension on activity
- ✅ Tab synchronization
- ✅ Automatic cleanup

```javascript
// Set token
secureStorage.setToken(token);

// Get token (validates expiration)
const token = secureStorage.getToken();

// Check if authenticated
if (secureStorage.isAuthenticated()) {
  // User is logged in
}

// Extend session on activity
secureStorage.extendSession();
```

### Token Blacklist

**Backend:** `backend/src/middleware/security.middleware.js`

```javascript
// On logout, add token to blacklist
blacklistedTokens.add(token);

// Check blacklist on every request
app.use(checkBlacklistedToken);
```

---

## Security Headers

### Implementation

**Location:** `backend/src/server.js`

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

### Headers Added

- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `DENY`
- **X-XSS-Protection:** `1; mode=block`
- **Strict-Transport-Security:** `max-age=31536000; includeSubDomains`
- **Content-Security-Policy:** See CSP configuration above
- **Referrer-Policy:** `no-referrer`

### Custom Security Headers

**Implementation:** `backend/src/middleware/security.middleware.js`

```javascript
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};
```

---

## API Security

### Request Validation

All API endpoints use validation middleware:

```javascript
import { body, param, validationResult } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const validation = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  validate  // Checks validationResult
];

router.post('/create', validation, controller);
```

### CORS Configuration

**Location:** `backend/src/server.js`

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
```

### Request Timeout

```javascript
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true
});
```

---

## Security Logging

### Implementation

**Location:** `backend/src/middleware/security.middleware.js`

### Events Logged

```javascript
// Authentication events
- LOGIN_SUCCESS: Successful login with userId and IP
- LOGIN_FAILED: Failed login with reason and IP
- AUTH_NO_TOKEN: Request without token
- AUTH_USER_NOT_FOUND: Token valid but user doesn't exist
- AUTH_INVALID_TOKEN: Invalid token format
- AUTH_TOKEN_EXPIRED: Expired token
- AUTH_ERROR: General auth error

// Security events
- RATE_LIMIT_EXCEEDED: Too many requests
- ACCOUNT_LOCKOUT: Account locked due to failed attempts
- FILE_UPLOAD_REJECTED: Invalid file upload
- SUSPICIOUS_ACTIVITY: Potential attack detected
- IP_BLOCKED: Request from blocked IP
```

### Log Format

```javascript
{
  timestamp: '2024-01-01T12:00:00.000Z',
  type: 'LOGIN_FAILED',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  userId: '507f1f77bcf86cd799439011',
  details: { reason: 'Invalid password', attempts: 3 }
}
```

### Production Logging

For production, integrate with logging services:

```bash
# Install Winston for better logging
npm install winston

# Or use cloud logging
npm install @google-cloud/logging  # Google Cloud
npm install aws-sdk                # AWS CloudWatch
npm install @azure/monitor         # Azure Monitor
```

---

## Deployment Security

### Environment Variables

**Required Variables:**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/todo
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/todo

# Authentication
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters
JWT_EXPIRE=24h

# Server
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting (optional - for Redis)
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/var/uploads

# Security
SESSION_SECRET=another-secure-secret-key
ENCRYPTION_KEY=32-character-encryption-key
```

### HTTPS Configuration

**Nginx Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Production Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled with valid SSL certificate
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] File upload limits enforced
- [ ] Database backups automated
- [ ] Security logging enabled
- [ ] Error logging configured
- [ ] Password requirements enforced
- [ ] Account lockout enabled
- [ ] CSRF protection active
- [ ] XSS prevention implemented
- [ ] NoSQL injection prevention active
- [ ] Session timeout configured
- [ ] Audit logs reviewed regularly

---

## Security Testing

### Manual Testing

1. **Authentication Testing**
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Test account lockout
# After 5 failed attempts, should return locked message
```

2. **XSS Testing**
```bash
# Try to inject script
curl -X POST http://localhost:5001/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(\"XSS\")</script>"}'

# Should be sanitized
```

3. **NoSQL Injection Testing**
```bash
# Try NoSQL injection
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'

# Should be blocked
```

### Automated Security Testing

```bash
# Install OWASP ZAP or Burp Suite for automated testing
# npm install -g retire  # Check for vulnerable dependencies
retire --path ./

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

### Penetration Testing Tools

- **OWASP ZAP:** Automated security testing
- **Burp Suite:** Manual penetration testing
- **SQLMap:** SQL/NoSQL injection testing
- **Nikto:** Web server scanner
- **Nmap:** Port scanner

---

## Incident Response

### If a Security Breach Occurs

1. **Immediate Actions**
   - Rotate all JWT secrets
   - Force logout all users
   - Block suspicious IPs
   - Review security logs
   - Backup current database

2. **Investigation**
   - Check security logs
   - Identify breach vector
   - Assess data exposure
   - Document timeline

3. **Remediation**
   - Patch vulnerability
   - Update affected users
   - Enhance monitoring
   - Review security policies

4. **Prevention**
   - Update security measures
   - Conduct security audit
   - Train development team
   - Implement additional logging

---

## Security Maintenance

### Regular Tasks

**Weekly:**
- Review security logs
- Check for unusual activity
- Update dependencies

**Monthly:**
- Run security audit
- Review access logs
- Test backup restoration
- Update security patches

**Quarterly:**
- Penetration testing
- Security training
- Policy review
- Audit user permissions

---

## Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)

### Contact

For security issues, contact: security@yourdomain.com

**Do not disclose security vulnerabilities publicly.**
