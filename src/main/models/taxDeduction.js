const mongoose = require('mongoose');

const taxDeductionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deduction', 'credit', 'exemption']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'charitable_contributions',
      'medical_expenses',
      'education',
      'home_office',
      'business_expenses',
      'retirement_contributions',
      'mortgage_interest',
      'property_tax',
      'state_local_tax',
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
  status: {
    type: String,
    required: true,
    enum: ['planned', 'claimed', 'verified', 'rejected'],
    default: 'planned'
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
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually']
    },
    startDate: Date,
    endDate: Date
  },
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
taxDeductionSchema.index({ user: 1, year: 1 });
taxDeductionSchema.index({ user: 1, type: 1 });
taxDeductionSchema.index({ user: 1, category: 1 });
taxDeductionSchema.index({ user: 1, status: 1 });

// Method to check if deduction is valid for a given year
taxDeductionSchema.methods.isValidForYear = function(year) {
  if (this.year !== year) return false;
  if (this.isRecurring) {
    return (!this.recurrence.startDate || this.recurrence.startDate.getFullYear() <= year) &&
           (!this.recurrence.endDate || this.recurrence.endDate.getFullYear() >= year);
  }
  return true;
};

// Method to calculate total deductions by category
taxDeductionSchema.statics.getTotalByCategory = async function(userId, year) {
  return this.aggregate([
    { $match: { user: userId, year: year } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
};

const TaxDeduction = mongoose.model('TaxDeduction', taxDeductionSchema);

module.exports = TaxDeduction; 