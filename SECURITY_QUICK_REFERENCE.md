# Security Quick Reference

Quick reference for security features and common tasks in the Todo application.

## 🔐 Authentication

### Login Security
```javascript
// Backend: auth.routes.js
POST /api/auth/login
- Rate limit: 5 requests per 15 minutes
- Account lockout: 5 failed attempts = 15 min lockout
- Password strength: 8+ chars, uppercase, lowercase, number, special char
- Security logging: All attempts logged

// Frontend: Login page
import secureStorage from './utils/secureStorage';
secureStorage.setToken(token);
```

### Token Management
```javascript
// Get token
const token = secureStorage.getToken();

// Check if authenticated
if (secureStorage.isAuthenticated()) { }

// Logout
secureStorage.removeToken();

// Extend session
secureStorage.extendSession();
```

---

## 🛡️ Input Sanitization

### Backend
```javascript
// Already applied globally
app.use(sanitizeInput);

// Manual sanitization
import { sanitizeText } from './middleware/security.middleware';
const clean = sanitizeText(userInput);
```

### Frontend
```javascript
import { sanitizeText, sanitizeHTML, sanitizeURL } from './utils/xssProtection';

// Sanitize plain text
const title = sanitizeText(userInput);

// Sanitize rich HTML
const content = sanitizeHTML(userHTML);

// Sanitize URLs
const link = sanitizeURL(userURL);
```

---

## 🚦 Rate Limiting

### Current Limits
- **Auth endpoints:** 5 requests / 15 minutes
- **API endpoints:** 100 requests / 15 minutes  
- **File uploads:** 10 requests / hour

### Apply to Routes
```javascript
import { authRateLimiter, apiRateLimiter, uploadRateLimiter } from './middleware/security.middleware';

router.post('/login', authRateLimiter, controller);
router.get('/todos', apiRateLimiter, controller);
router.post('/upload', uploadRateLimiter, controller);
```

---

## 🔒 CSRF Protection

### Backend
```javascript
// Get CSRF token
GET /api/auth/csrf-token
Response: { csrfToken: "..." }

// Verify token
import { verifyCsrfToken } from './middleware/security.middleware';
router.post('/create', verifyCsrfToken, controller);
```

### Frontend
```javascript
// Automatic in api/client.js
// CSRF token added to POST, PUT, DELETE, PATCH requests
// No manual intervention needed
```

---

## 📁 File Upload Security

### Configuration
```javascript
// Max file size: 10MB
// Allowed types: jpg, jpeg, png, gif, webp, pdf, doc, docx
// Path traversal prevention: enabled
// MIME type validation: strict

// Usage
import { uploadRateLimiter, validateFileUpload } from './middleware/security.middleware';
router.post('/upload',
  uploadRateLimiter,
  upload.single('file'),
  validateFileUpload,
  controller
);
```

---

## 🔑 Password Security

### Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Implementation
```javascript
// Backend validation
import { passwordStrengthValidator } from './middleware/security.middleware';
router.post('/register', passwordStrengthValidator, controller);

// Frontend validation
import { validatePassword, getPasswordStrength } from './utils/secureStorage';

if (validatePassword(password)) {
  // Password is strong
}

const strength = getPasswordStrength(password);
// Returns: { strength: 'weak|medium|strong', score: 0-6, checks: {...} }
```

---

## 📊 Security Logging

### Event Types
```
AUTH EVENTS:
- LOGIN_SUCCESS
- LOGIN_FAILED
- AUTH_NO_TOKEN
- AUTH_USER_NOT_FOUND
- AUTH_INVALID_TOKEN
- AUTH_TOKEN_EXPIRED

SECURITY EVENTS:
- RATE_LIMIT_EXCEEDED
- ACCOUNT_LOCKOUT
- FILE_UPLOAD_REJECTED
- SUSPICIOUS_ACTIVITY
- IP_BLOCKED
```

### View Logs
```bash
# Production logs
pm2 logs

# Security logs stored in MongoDB (optional)
# Query Activity model for security events
```

---

## 🌐 API Security

### Protected Route Pattern
```javascript
// Backend
router.post('/create',
  apiRateLimiter,        // Rate limiting
  sanitizeInput,         // XSS prevention
  authenticate,          // JWT verification
  validate,              // Input validation
  controller             // Business logic
);
```

### Frontend API Calls
```javascript
import api from './api/client';

// Automatic features:
// - JWT token added
// - CSRF token added (state-changing requests)
// - Request timeout (30s)
// - Automatic token refresh
// - Error handling

const response = await api.post('/todos', data);
```

---

## 🚨 Common Security Tasks

### 1. Add Security to New Route

**Backend:**
```javascript
import { apiRateLimiter, sanitizeInput } from './middleware/security.middleware';
import { authenticate } from './middleware/auth.middleware';

router.post('/my-route',
  apiRateLimiter,
  sanitizeInput,
  authenticate,
  [
    body('field').trim().notEmpty().escape()
  ],
  validate,
  myController
);
```

### 2. Render User Content Safely

**Frontend:**
```jsx
import { SafeHTML } from './utils/xssProtection';

<SafeHTML 
  html={userContent} 
  className="user-content"
  allowedTags={['b', 'i', 'p', 'br']}
/>
```

### 3. Validate User Input

**Frontend:**
```javascript
import { validateInput, ValidationPatterns } from './utils/xssProtection';

if (validateInput(email, 'email')) {
  // Valid email
}

if (validateInput(password, 'strongPassword')) {
  // Strong password
}
```

### 4. Add Client-Side Rate Limiting

**Frontend:**
```javascript
import { ClientRateLimiter } from './utils/xssProtection';

const limiter = new ClientRateLimiter(5, 60000); // 5 attempts per minute

if (limiter.canProceed('search')) {
  performSearch();
} else {
  showError('Too many searches, please wait');
}
```

### 5. Track Failed Login Attempts

**Backend:**
```javascript
import { trackLoginAttempts, resetLoginAttempts } from './middleware/security.middleware';

// On failed login
trackLoginAttempts(email, ip);

// On successful login
resetLoginAttempts(email);
```

---

## 🔧 Environment Variables

### Required for Security
```bash
# JWT
JWT_SECRET=your-super-secure-secret-minimum-32-chars
JWT_EXPIRE=24h

# Node Environment
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/todo

# Session
SESSION_SECRET=another-secure-secret-key

# Optional: Redis for distributed rate limiting
REDIS_URL=redis://localhost:6379
```

---

## 🧪 Testing Security

### Test Rate Limiting
```bash
# Should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Test XSS Prevention
```bash
# Script tags should be removed
curl -X POST http://localhost:5001/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(\"XSS\")</script>Test"}'
```

### Test File Upload Limits
```bash
# Should reject files > 10MB
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@largefile.jpg"
```

---

## 📋 Security Checklist

### Development
- [ ] All user input sanitized
- [ ] All routes have authentication
- [ ] File uploads validated
- [ ] Rate limiting applied
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Security logging active

### Pre-Production
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Dependencies updated
- [ ] `npm audit` clean
- [ ] SSL certificate configured
- [ ] Production secrets generated
- [ ] Backup system tested
- [ ] Monitoring configured
- [ ] Incident response plan ready

### Production
- [ ] HTTPS enforced
- [ ] Security headers verified
- [ ] Rate limits appropriate
- [ ] Logs being collected
- [ ] Automated backups running
- [ ] Security updates subscribed
- [ ] Team trained on security
- [ ] Regular audits scheduled

---

## 🆘 Emergency Procedures

### If Breach Detected

1. **Immediate:**
   ```bash
   # Rotate JWT secret (forces all logouts)
   # Update .env
   JWT_SECRET=new-secure-secret-key
   
   # Restart server
   pm2 restart all
   
   # Block suspicious IPs in nginx
   sudo nano /etc/nginx/blocked-ips.conf
   # Add: deny 192.168.1.1;
   sudo nginx -s reload
   ```

2. **Investigation:**
   ```bash
   # Check recent logs
   pm2 logs --lines 1000
   
   # Check failed auth attempts
   # Query Activity model for LOGIN_FAILED events
   
   # Check file uploads
   ls -laht backend/uploads/
   ```

3. **Recovery:**
   - Review all security logs
   - Identify breach vector
   - Patch vulnerability
   - Notify affected users
   - Update security docs

---

## 📚 Additional Resources

- Full Documentation: [SECURITY.md](./SECURITY.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## 🔗 Quick Links

| Feature | Backend Location | Frontend Location |
|---------|-----------------|-------------------|
| Auth Middleware | `backend/src/middleware/auth.middleware.js` | `frontend/src/api/client.js` |
| Security Middleware | `backend/src/middleware/security.middleware.js` | - |
| Token Storage | - | `frontend/src/utils/secureStorage.js` |
| XSS Protection | `backend/src/middleware/security.middleware.js` | `frontend/src/utils/xssProtection.js` |
| File Upload Config | `backend/src/config/upload.js` | - |
| Password Hashing | `backend/src/models/User.model.js` | - |
| Rate Limiting | `backend/src/middleware/security.middleware.js` | - |
| CSRF Protection | `backend/src/middleware/security.middleware.js` | `frontend/src/api/client.js` |

---

**Last Updated:** December 2024  
**Version:** 1.0.0
