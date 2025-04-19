const mongoose = require('mongoose');

const taxSummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  year: {
    type: Number,
    required: true
  },
  filingStatus: {
    type: String,
    required: true,
    enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household']
  },
  incomeSummary: {
    totalIncome: {
      type: Number,
      required: true,
      min: 0
    },
    taxableIncome: {
      type: Number,
      required: true,
      min: 0
    },
    incomeByType: [{
      type: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  },
  deductionSummary: {
    totalDeductions: {
      type: Number,
      required: true,
      min: 0
    },
    standardDeduction: {
      type: Number,
      required: true,
      min: 0
    },
    itemizedDeductions: {
      type: Number,
      required: true,
      min: 0
    },
    deductionsByCategory: [{
      category: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  },
  taxCalculation: {
    grossTax: {
      type: Number,
      required: true,
      min: 0
    },
    credits: {
      type: Number,
      required: true,
      min: 0
    },
    taxWithheld: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedPayments: {
      type: Number,
      required: true,
      min: 0
    },
    netTax: {
      type: Number,
      required: true
    },
    refundOrDue: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'reviewed', 'filed', 'accepted', 'rejected'],
    default: 'draft'
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['w2', '1099', 'tax_return', 'supporting_document']
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
  audit: {
    lastReviewedBy: {
      type: String,
      trim: true
    },
    lastReviewedDate: Date,
    reviewNotes: String,
    changes: [{
      date: {
        type: Date,
        required: true
      },
      field: {
        type: String,
        required: true
      },
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      reason: String
    }]
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taxSummarySchema.index({ user: 1, year: 1 });
taxSummarySchema.index({ user: 1, status: 1 });
taxSummarySchema.index({ user: 1, 'taxCalculation.refundOrDue': 1 });

// Method to calculate tax liability
taxSummarySchema.methods.calculateTaxLiability = function() {
  return this.taxCalculation.grossTax - 
         this.taxCalculation.credits - 
         this.taxCalculation.taxWithheld - 
         this.taxCalculation.estimatedPayments;
};

// Method to check if summary is complete
taxSummarySchema.methods.isComplete = function() {
  return this.status !== 'draft' && 
         this.incomeSummary.totalIncome > 0 &&
         this.deductionSummary.totalDeductions >= 0 &&
         this.taxCalculation.grossTax >= 0;
};

// Static method to get tax summaries by year range
taxSummarySchema.statics.getSummariesByYearRange = async function(userId, startYear, endYear) {
  return this.find({
    user: userId,
    year: { $gte: startYear, $lte: endYear }
  }).sort({ year: 1 });
};

const TaxSummary = mongoose.model('TaxSummary', taxSummarySchema);

module.exports = TaxSummary; 