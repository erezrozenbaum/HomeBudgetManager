const rateLimit = require('express-rate-limit');
const compression = require('compression');
const NodeCache = require('node-cache');

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.send(cachedResponse);
    }

    // Override res.send to cache the response
    const originalSend = res.send;
    res.send = function (body) {
      cache.set(key, body, duration);
      originalSend.call(this, body);
    };

    next();
  };
};

// Response compression middleware
const compressionMiddleware = compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Query optimization middleware
const queryOptimizationMiddleware = (req, res, next) => {
  // Add pagination if not present
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.limit) {
    req.query.limit = 50;
  }

  // Validate and sanitize query parameters
  const page = Math.max(1, parseInt(req.query.page));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit)));

  req.query.page = page;
  req.query.limit = limit;
  req.query.offset = (page - 1) * limit;

  next();
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    console.log(`${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
  });

  next();
};

module.exports = {
  apiLimiter,
  cacheMiddleware,
  compressionMiddleware,
  queryOptimizationMiddleware,
  performanceMiddleware,
}; 