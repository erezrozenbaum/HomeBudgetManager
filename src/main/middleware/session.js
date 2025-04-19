const securityService = require('../services/security');

const sessionMiddleware = (req, res, next) => {
  // Initialize session if it doesn't exist
  if (!req.session) {
    req.session = {};
  }

  // Check if the request is for authentication endpoints
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  // Check if password protection is enabled
  if (securityService.isPasswordProtected()) {
    // Check if user is authenticated
    if (!req.session.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  next();
};

module.exports = sessionMiddleware; 