const mongoose = require('mongoose');

const businessTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business'
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
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense', 'investment', 'loan', 'refund']
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
  taxRelated: {
    isDeductible: {
      type: Boolean,
      default: false
    },
    deductionCategory: String,
    taxYear: Number,
    notes: String
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['invoice', 'receipt', 'contract', 'other']
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled', 'disputed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'other']
  },
  paymentDetails: {
    referenceNumber: String,
    checkNumber: String,
    cardLastFour: String,
    bankAccount: String
  },
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
businessTransactionSchema.index({ user: 1, business: 1 });
businessTransactionSchema.index({ user: 1, date: 1 });
businessTransactionSchema.index({ user: 1, type: 1 });
businessTransactionSchema.index({ user: 1, 'taxRelated.isDeductible': 1 });

// Static method to get transactions by business
businessTransactionSchema.statics.getByBusiness = async function(userId, businessId, startDate, endDate) {
  const query = { user: userId, business: businessId };
  
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  return this.find(query).sort({ date: -1 });
};

// Static method to get transactions by type
businessTransactionSchema.statics.getByType = async function(userId, businessId, type) {
  return this.find({
    user: userId,
    business: businessId,
    type: type
  }).sort({ date: -1 });
};

// Static method to get deductible transactions
businessTransactionSchema.statics.getDeductibleTransactions = async function(userId, businessId, taxYear) {
  return this.find({
    user: userId,
    business: businessId,
    'taxRelated.isDeductible': true,
    'taxRelated.taxYear': taxYear
  }).sort({ date: -1 });
};

// Static method to get business summary
businessTransactionSchema.statics.getBusinessSummary = async function(userId, businessId, startDate, endDate) {
  return this.aggregate([
    { $match: { user: userId, business: businessId, date: { $gte: startDate, $lte: endDate } } },
    { $group: {
      _id: '$type',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    } }
  ]);
};

// Static method to get tax summary
businessTransactionSchema.statics.getTaxSummary = async function(userId, businessId, taxYear) {
  return this.aggregate([
    { $match: { 
      user: userId, 
      business: businessId, 
      'taxRelated.isDeductible': true,
      'taxRelated.taxYear': taxYear 
    } },
    { $group: {
      _id: '$taxRelated.deductionCategory',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 }
    } }
  ]);
};

const BusinessTransaction = mongoose.model('BusinessTransaction', businessTransactionSchema);

module.exports = BusinessTransaction; 