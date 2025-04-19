const mongoose = require('mongoose');

const unplannedTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  originalTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Transaction'
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: String,
  description: {
    type: String,
    required: true,
    trim: true
  },
  impact: {
    type: String,
    required: true,
    enum: ['positive', 'negative', 'neutral']
  },
  emergencyLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  tags: [{
    type: String,
    trim: true
  }],
  analysis: {
    monthlyAverage: Number,
    quarterlyAverage: Number,
    yearlyAverage: Number,
    trend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    },
    lastUpdated: Date
  },
  relatedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  notes: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
unplannedTransactionSchema.index({ user: 1, date: 1 });
unplannedTransactionSchema.index({ user: 1, category: 1, subCategory: 1 });
unplannedTransactionSchema.index({ user: 1, impact: 1 });
unplannedTransactionSchema.index({ user: 1, emergencyLevel: 1 });

// Static method to get unplanned transactions by time period
unplannedTransactionSchema.statics.getByTimePeriod = async function(userId, period, startDate, endDate) {
  const query = { user: userId };
  
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  return this.find(query).sort({ date: -1 });
};

// Static method to get unplanned transactions by category
unplannedTransactionSchema.statics.getByCategory = async function(userId, category, subCategory = null) {
  const query = { user: userId };
  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;

  return this.find(query).sort({ date: -1 });
};

// Static method to get unplanned transactions by impact
unplannedTransactionSchema.statics.getByImpact = async function(userId, impact) {
  return this.find({
    user: userId,
    impact: impact
  }).sort({ date: -1 });
};

// Static method to get unplanned transactions by emergency level
unplannedTransactionSchema.statics.getByEmergencyLevel = async function(userId, level) {
  return this.find({
    user: userId,
    emergencyLevel: level
  }).sort({ date: -1 });
};

// Static method to get monthly summary
unplannedTransactionSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.aggregate([
    { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
    { $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    } }
  ]);
};

// Static method to get quarterly summary
unplannedTransactionSchema.statics.getQuarterlySummary = async function(userId, year, quarter) {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);

  return this.aggregate([
    { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
    { $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    } }
  ]);
};

// Static method to get yearly summary
unplannedTransactionSchema.statics.getYearlySummary = async function(userId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  return this.aggregate([
    { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
    { $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    } }
  ]);
};

const UnplannedTransaction = mongoose.model('UnplannedTransaction', unplannedTransactionSchema);

module.exports = UnplannedTransaction; 