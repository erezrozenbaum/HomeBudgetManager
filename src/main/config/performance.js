const performanceConfig = {
  // Database optimization
  database: {
    // Enable query caching
    queryCache: true,
    // Maximum number of cached queries
    maxCachedQueries: 1000,
    // Cache expiration time in milliseconds
    cacheExpiration: 3600000, // 1 hour
    // Batch size for bulk operations
    batchSize: 100,
    // Index optimization
    indexes: {
      // Enable automatic index creation
      autoCreate: true,
      // Background index creation
      background: true
    }
  },

  // API optimization
  api: {
    // Enable response compression
    compression: true,
    // Cache control headers
    cacheControl: {
      // Default cache duration in seconds
      default: 3600, // 1 hour
      // Cache duration for static assets
      static: 86400 // 24 hours
    },
    // Rate limiting
    rateLimit: {
      // Maximum requests per window
      max: 100,
      // Time window in milliseconds
      windowMs: 60000 // 1 minute
    }
  },

  // Frontend optimization
  frontend: {
    // Code splitting configuration
    codeSplitting: {
      // Enable dynamic imports
      dynamicImports: true,
      // Chunk size limit in bytes
      chunkSizeLimit: 244 * 1024, // 244KB
      // Preload critical chunks
      preloadCritical: true
    },
    // Asset optimization
    assets: {
      // Enable image optimization
      optimizeImages: true,
      // Enable font optimization
      optimizeFonts: true,
      // Enable CSS minification
      minifyCSS: true,
      // Enable JavaScript minification
      minifyJS: true
    },
    // Caching strategy
    caching: {
      // Enable service worker
      serviceWorker: true,
      // Cache version
      version: '1.0.0',
      // Cache patterns
      patterns: [
        '/static/**/*',
        '/api/cache/**/*'
      ]
    }
  },

  // Resource monitoring
  monitoring: {
    // Memory usage threshold (in MB)
    memoryThreshold: 1024,
    // CPU usage threshold (percentage)
    cpuThreshold: 80,
    // Disk space threshold (in MB)
    diskThreshold: 1024,
    // Check interval in milliseconds
    checkInterval: 60000 // 1 minute
  },

  // Logging optimization
  logging: {
    // Log level
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    // Maximum log file size in MB
    maxFileSize: 10,
    // Maximum number of log files
    maxFiles: 5,
    // Log rotation interval
    rotationInterval: '1d'
  }
};

module.exports = performanceConfig; 