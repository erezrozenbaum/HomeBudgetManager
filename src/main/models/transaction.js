const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense', 'transfer']
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
  // New fields for transaction types
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction'
  },
  isUnplanned: {
    type: Boolean,
    default: false
  },
  unplannedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnplannedTransaction'
  },
  isBusiness: {
    type: Boolean,
    default: false
  },
  businessTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessTransaction'
  },
  // Payment method details
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other']
  },
  paymentDetails: {
    accountNumber: String,
    checkNumber: String,
    cardLastFour: String,
    referenceNumber: String
  },
  // Additional metadata
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ user: 1, date: 1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, isRecurring: 1 });
transactionSchema.index({ user: 1, isUnplanned: 1 });
transactionSchema.index({ user: 1, isBusiness: 1 });

// Method to check if transaction is recurring
transactionSchema.methods.isRecurringTransaction = function() {
  return this.isRecurring && this.recurringTransaction;
};

// Method to check if transaction is unplanned
transactionSchema.methods.isUnplannedTransaction = function() {
  return this.isUnplanned && this.unplannedTransaction;
};

// Method to check if transaction is business-related
transactionSchema.methods.isBusinessTransaction = function() {
  return this.isBusiness && this.businessTransaction;
};

// Static method to get transactions by type
transactionSchema.statics.getByType = async function(userId, type, startDate, endDate) {
  const query = { user: userId, type: type };
  
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  return this.find(query).sort({ date: -1 });
};

// Static method to get recurring transactions
transactionSchema.statics.getRecurringTransactions = async function(userId) {
  return this.find({
    user: userId,
    isRecurring: true
  }).sort({ date: -1 });
};

// Static method to get unplanned transactions
transactionSchema.statics.getUnplannedTransactions = async function(userId) {
  return this.find({
    user: userId,
    isUnplanned: true
  }).sort({ date: -1 });
};

// Static method to get business transactions
transactionSchema.statics.getBusinessTransactions = async function(userId) {
  return this.find({
    user: userId,
    isBusiness: true
  }).sort({ date: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 