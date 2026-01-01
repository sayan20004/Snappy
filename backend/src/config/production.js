/**
 * Production Configuration Checklist
 * Complete this checklist before deploying to production
 */

export const ProductionChecklist = {
  // Environment Variables
  environment: {
    NODE_ENV: 'Must be set to "production"',
    PORT: 'Set appropriate port (default: 5000)',
    MONGODB_URI: 'Use MongoDB Atlas or hosted instance with authentication',
    JWT_SECRET: 'Use strong, randomly generated secret (minimum 64 characters)',
    CORS_ORIGIN: 'Set to your frontend domain(s)',
  },

  // Security
  security: {
    helmet: 'Configured with appropriate CSP policies',
    rateLimit: 'Enabled and configured per route',
    cors: 'Restricted to specific origins',
    bodyParser: 'Size limits configured (10mb default)',
    fileUpload: 'File type validation and size limits',
    authentication: 'JWT tokens with secure secrets',
    passwordHashing: 'bcrypt with 12 rounds minimum',
  },

  // Performance
  performance: {
    compression: 'Enabled with gzip/deflate',
    caching: 'Static assets cached with proper headers',
    databaseIndexes: 'Created for frequently queried fields',
    connectionPooling: 'MongoDB connection pooling configured',
    queryOptimization: 'Use .lean() for read-only queries',
    pagination: 'Implemented for large data sets',
  },

  // Monitoring
  monitoring: {
    logging: 'Production logger configured (Winston/Bunyan)',
    errorTracking: 'Sentry or similar service configured',
    healthCheck: '/health endpoint responding correctly',
    uptime: 'Monitoring service configured (UptimeRobot, etc.)',
    metrics: 'Performance metrics tracked',
  },

  // Database
  database: {
    backups: 'Automated backups configured',
    replication: 'MongoDB replica set for high availability',
    indexes: 'Proper indexes created on collections',
    validation: 'Schema validation rules defined',
    migrations: 'Migration strategy in place',
  },

  // API
  api: {
    versioning: 'API versioning strategy (e.g., /api/v1/)',
    documentation: 'API documentation available (Swagger/Postman)',
    validation: 'Request validation on all endpoints',
    errorHandling: 'Consistent error response format',
    pagination: 'Pagination on list endpoints',
    filtering: 'Query filters validated',
  },

  // Socket.IO
  socketIO: {
    authentication: 'Socket connections authenticated',
    rateLimiting: 'Message rate limiting configured',
    errorHandling: 'Socket error handlers in place',
    reconnection: 'Reconnection strategy configured',
    rooms: 'Room access control implemented',
  },

  // Frontend
  frontend: {
    minification: 'Code minified for production',
    bundleSize: 'Bundle size optimized (check with vite build)',
    codeSplitting: 'Route-based code splitting implemented',
    lazyLoading: 'Images and components lazy loaded',
    caching: 'Service worker or HTTP caching',
    errorBoundaries: 'Error boundaries for critical components',
  },

  // DevOps
  devops: {
    processManager: 'PM2 or similar for process management',
    reverseProxy: 'Nginx or similar configured',
    ssl: 'HTTPS/SSL certificates configured',
    firewall: 'Firewall rules configured',
    updates: 'Update strategy defined',
    rollback: 'Rollback procedure documented',
  },

  // Testing
  testing: {
    unitTests: 'Core functionality tested',
    integrationTests: 'API endpoints tested',
    e2eTests: 'Critical user flows tested',
    loadTesting: 'Load testing performed',
    securityTesting: 'Security audit completed',
  },

  // Documentation
  documentation: {
    readme: 'README with setup instructions',
    apiDocs: 'API documentation complete',
    deploymentGuide: 'Deployment guide written',
    architecture: 'Architecture diagram available',
    runbook: 'Operational runbook created',
  },

  // Compliance
  compliance: {
    gdpr: 'GDPR compliance if applicable',
    dataRetention: 'Data retention policy defined',
    privacyPolicy: 'Privacy policy published',
    termsOfService: 'Terms of service available',
    cookies: 'Cookie consent implemented if needed',
  }
};

/**
 * Pre-deployment validation script
 */
export const validateProduction = () => {
  const checks = {
    environment: [],
    security: [],
    performance: [],
  };

  // Check environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'CORS_ORIGIN',
  ];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      checks.environment.push(`❌ ${varName} is not set`);
    } else {
      checks.environment.push(`✅ ${varName} is set`);
    }
  });

  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    checks.environment.push('⚠️  NODE_ENV is not set to "production"');
  }

  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    checks.security.push('⚠️  JWT_SECRET should be at least 32 characters');
  } else {
    checks.security.push('✅ JWT_SECRET has adequate length');
  }

  // Check CORS
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes('localhost')) {
    checks.security.push('⚠️  CORS_ORIGIN includes localhost in production');
  } else {
    checks.security.push('✅ CORS_ORIGIN properly configured');
  }

  return checks;
};

/**
 * Performance optimization recommendations
 */
export const PerformanceRecommendations = {
  backend: [
    'Enable MongoDB indexes on frequently queried fields',
    'Use Redis for session storage and caching',
    'Implement CDN for static assets',
    'Enable HTTP/2 on reverse proxy',
    'Configure database connection pooling',
    'Use PM2 cluster mode for multi-core utilization',
    'Implement response caching for read-heavy endpoints',
    'Optimize database queries with .lean() and projection',
    'Use background jobs for heavy operations',
    'Implement request/response compression',
  ],

  frontend: [
    'Optimize bundle size with tree-shaking',
    'Implement route-based code splitting',
    'Use lazy loading for images and components',
    'Enable service worker for offline support',
    'Minimize and compress assets',
    'Use CDN for third-party libraries',
    'Implement virtual scrolling for large lists',
    'Optimize re-renders with React.memo and useMemo',
    'Debounce expensive operations',
    'Preload critical resources',
  ],

  database: [
    'Create compound indexes for complex queries',
    'Use sparse indexes where appropriate',
    'Enable index intersection when beneficial',
    'Monitor and optimize slow queries',
    'Implement data archival strategy',
    'Use projection to limit returned fields',
    'Enable read preference for read replicas',
    'Optimize schema design for access patterns',
    'Use aggregation pipeline efficiently',
    'Implement database sharding if needed',
  ],
};
