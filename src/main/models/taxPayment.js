const mongoose = require('mongoose');

const taxPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['estimated', 'final', 'extension', 'amendment']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'pending', 'completed', 'failed', 'refunded'],
    default: 'scheduled'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'check', 'money_order']
  },
  paymentDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    },
    cardNumber: {
      type: String,
      trim: true
    },
    cardType: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover']
    },
    checkNumber: {
      type: String,
      trim: true
    }
  },
  confirmation: {
    number: {
      type: String,
      trim: true
    },
    date: Date,
    amount: Number
  },
  taxSummary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxSummary'
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['receipt', 'confirmation', 'bank_statement', 'other']
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
  notes: {
    type: String,
    trim: true
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    notes: String,
    updatedBy: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
taxPaymentSchema.index({ user: 1, year: 1 });
taxPaymentSchema.index({ user: 1, type: 1 });
taxPaymentSchema.index({ user: 1, status: 1 });
taxPaymentSchema.index({ user: 1, paymentDate: 1 });

// Method to check if payment is late
taxPaymentSchema.methods.isLate = function() {
  return this.paymentDate > this.dueDate;
};

// Method to calculate days late
taxPaymentSchema.methods.daysLate = function() {
  if (!this.isLate()) return 0;
  const diffTime = Math.abs(this.paymentDate - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static method to get total payments by type for a year
taxPaymentSchema.statics.getTotalByType = async function(userId, year) {
  return this.aggregate([
    { $match: { user: userId, year: year } },
    { $group: { 
      _id: '$type',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 }
    } }
  ]);
};

// Static method to get upcoming payments
taxPaymentSchema.statics.getUpcomingPayments = async function(userId, days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return this.find({
    user: userId,
    paymentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'pending'] }
  }).sort({ paymentDate: 1 });
};

const TaxPayment = mongoose.model('TaxPayment', taxPaymentSchema);

module.exports = TaxPayment; 