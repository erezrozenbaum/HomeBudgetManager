const mongoose = require('mongoose');

const userAuditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_transaction',
      'update_transaction',
      'delete_transaction',
      'create_investment',
      'update_investment',
      'delete_investment',
      'create_stock',
      'update_stock',
      'delete_stock',
      'create_crypto',
      'update_crypto',
      'delete_crypto',
      'import_data',
      'export_data',
      'update_settings',
      'update_profile'
    ]
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
userAuditSchema.index({ userId: 1, timestamp: -1 });
userAuditSchema.index({ action: 1, timestamp: -1 });

// Static methods
userAuditSchema.statics.getUserActions = async function(userId, startDate, endDate) {
  const query = { userId };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .lean();
};

userAuditSchema.statics.getRecentActions = async function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'username email')
    .lean();
};

const UserAudit = mongoose.model('UserAudit', userAuditSchema);

module.exports = UserAudit; 