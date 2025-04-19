const Sentry = require('@sentry/node');
const newrelic = require('newrelic');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
    new Sentry.Integrations.Mongo({ useMongoose: true })
  ]
});

// Error tracking middleware
const errorTracking = (app) => {
  // Sentry request handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Sentry error handler
  app.use(Sentry.Handlers.errorHandler());

  // Custom error handler
  app.use((err, req, res, next) => {
    // Log to Sentry
    Sentry.captureException(err);

    // Log to New Relic
    newrelic.noticeError(err);

    next(err);
  });
};

// Performance monitoring
const performanceMonitoring = {
  // Track API response time
  trackResponseTime: (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;
      
      // Log to New Relic
      newrelic.recordMetric('Custom/API/ResponseTime', duration);
      
      // Log to Sentry
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `API Response Time: ${duration}ms`,
        level: 'info',
        data: {
          path: req.path,
          method: req.method,
          duration
        }
      });
    });
    next();
  },

  // Track database query performance
  trackDatabaseQuery: (query) => {
    const start = process.hrtime();
    return {
      end: () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        // Log to New Relic
        newrelic.recordMetric('Custom/Database/QueryTime', duration);
        
        // Log to Sentry
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Database Query Time: ${duration}ms`,
          level: 'info',
          data: {
            query,
            duration
          }
        });
      }
    };
  }
};

// Resource monitoring
const resourceMonitoring = {
  // Track memory usage
  trackMemoryUsage: () => {
    const memoryUsage = process.memoryUsage();
    
    // Log to New Relic
    newrelic.recordMetric('Custom/Memory/HeapUsed', memoryUsage.heapUsed);
    newrelic.recordMetric('Custom/Memory/HeapTotal', memoryUsage.heapTotal);
    
    // Log to Sentry
    Sentry.addBreadcrumb({
      category: 'resource',
      message: 'Memory Usage',
      level: 'info',
      data: memoryUsage
    });
  },

  // Track CPU usage
  trackCPUUsage: () => {
    const cpuUsage = process.cpuUsage();
    
    // Log to New Relic
    newrelic.recordMetric('Custom/CPU/User', cpuUsage.user);
    newrelic.recordMetric('Custom/CPU/System', cpuUsage.system);
    
    // Log to Sentry
    Sentry.addBreadcrumb({
      category: 'resource',
      message: 'CPU Usage',
      level: 'info',
      data: cpuUsage
    });
  }
};

module.exports = {
  errorTracking,
  performanceMonitoring,
  resourceMonitoring
}; 