const mongoose = require('mongoose');

const taxIncomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'salary',
      'wages',
      'self_employment',
      'investment',
      'rental',
      'pension',
      'social_security',
      'capital_gains',
      'dividends',
      'interest',
      'other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  year: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['one_time', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually']
  },
  taxWithheld: {
    type: Number,
    default: 0,
    min: 0
  },
  isTaxable: {
    type: Boolean,
    default: true
  },
  documentation: [{
    name: {
      type: String,
      required: true
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
  status: {
    type: String,
    required: true,
    enum: ['estimated', 'confirmed', 'verified', 'adjusted'],
    default: 'estimated'
  },
  adjustments: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    notes: String
  }],
  verification: {
    verifiedBy: {
      type: String,
      trim: true
    },
    verifiedDate: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taxIncomeSchema.index({ user: 1, year: 1 });
taxIncomeSchema.index({ user: 1, type: 1 });
taxIncomeSchema.index({ user: 1, status: 1 });

// Method to calculate annual income based on frequency
taxIncomeSchema.methods.calculateAnnualAmount = function() {
  const frequencyMultipliers = {
    one_time: 1,
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    annually: 1
  };

  return this.amount * frequencyMultipliers[this.frequency];
};

// Method to calculate total tax withheld for the year
taxIncomeSchema.methods.calculateAnnualTaxWithheld = function() {
  if (this.frequency === 'one_time') {
    return this.taxWithheld;
  }
  return this.calculateAnnualAmount() * (this.taxWithheld / this.amount);
};

// Static method to get total income by type for a year
taxIncomeSchema.statics.getTotalByType = async function(userId, year) {
  return this.aggregate([
    { $match: { user: userId, year: year } },
    { $group: { 
      _id: '$type',
      totalAmount: { $sum: '$amount' },
      totalTaxWithheld: { $sum: '$taxWithheld' }
    } }
  ]);
};

const TaxIncome = mongoose.model('TaxIncome', taxIncomeSchema);

module.exports = TaxIncome; 