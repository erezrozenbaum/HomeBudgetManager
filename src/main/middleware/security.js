const securityService = require('../services/security');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');

const securityMiddleware = (req, res, next) => {
  // Skip security check for authentication endpoints
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  // Check if password protection is enabled
  if (securityService.isPasswordProtected()) {
    // Check if user is authenticated
    if (!req.session || !req.session.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Log the action
  securityService.logAction('api_request', {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  next();
};

const encryptResponse = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (securityService.isEncryptionEnabled()) {
      try {
        const encryptedData = securityService.encryptData(data);
        return originalSend.call(this, encryptedData);
      } catch (error) {
        console.error('Error encrypting response:', error);
        return res.status(500).json({ error: 'Encryption failed' });
      }
    }
    return originalSend.call(this, data);
  };
  next();
};

const decryptRequest = (req, res, next) => {
  if (securityService.isEncryptionEnabled() && req.body) {
    try {
      req.body = securityService.decryptData(req.body);
    } catch (error) {
      console.error('Error decrypting request:', error);
      return res.status(400).json({ error: 'Invalid encrypted data' });
    }
  }
  next();
};

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = xss(req.query[key]);
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = xss(req.body[key]);
    });
  }
  
  next();
};

module.exports = {
  securityMiddleware,
  encryptResponse,
  decryptRequest,
  apiLimiter,
  securityHeaders,
  corsOptions,
  sanitizeInput,
  hpp: hpp()
}; 