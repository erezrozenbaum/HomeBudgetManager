const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
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
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  nextOccurrence: {
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
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  aiPrediction: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    predictedAmount: Number,
    predictedFrequency: String,
    lastUpdated: Date,
    notes: String
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    notes: String
  }],
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysBefore: {
      type: Number,
      default: 3
    },
    lastNotified: Date
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
recurringTransactionSchema.index({ user: 1, isActive: 1 });
recurringTransactionSchema.index({ user: 1, nextOccurrence: 1 });
recurringTransactionSchema.index({ user: 1, category: 1, subCategory: 1 });

// Method to calculate next occurrence
recurringTransactionSchema.methods.calculateNextOccurrence = function() {
  const now = new Date();
  let nextDate = new Date(this.nextOccurrence);

  while (nextDate <= now) {
    switch (this.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
  }

  return nextDate;
};

// Method to check if transaction is due
recurringTransactionSchema.methods.isDue = function() {
  return this.isActive && new Date() >= this.nextOccurrence;
};

// Static method to get recurring transactions by category
recurringTransactionSchema.statics.getByCategory = async function(userId, category, subCategory = null) {
  const query = { user: userId, isActive: true };
  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;

  return this.find(query).sort({ nextOccurrence: 1 });
};

// Static method to get due transactions
recurringTransactionSchema.statics.getDueTransactions = async function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    nextOccurrence: { $lte: new Date() }
  }).sort({ nextOccurrence: 1 });
};

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);

module.exports = RecurringTransaction; 