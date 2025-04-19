const { validationResult } = require('express-validator');

// Custom error class for API errors
class APIError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'APIError';
  }
}

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.errors
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

// Response logging middleware
const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`${new Date().toISOString()} - Response: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new APIError(401, 'Authentication required');
  }

  try {
    // Verify token and attach user to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw new APIError(401, 'Invalid token');
  }
};

// Role-based access control middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new APIError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new APIError(403, 'Insufficient permissions');
    }

    next();
  };
};

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

module.exports = {
  APIError,
  validateRequest,
  errorHandler,
  requestLogger,
  responseLogger,
  authenticate,
  authorize,
  rateLimiter
}; 