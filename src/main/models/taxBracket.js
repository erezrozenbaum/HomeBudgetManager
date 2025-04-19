const mongoose = require('mongoose');

const taxBracketSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    trim: true
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
  brackets: [{
    minIncome: {
      type: Number,
      required: true,
      min: 0
    },
    maxIncome: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    baseTax: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  standardDeduction: {
    type: Number,
    required: true,
    min: 0
  },
  personalExemption: {
    type: Number,
    required: true,
    min: 0
  },
  additionalExemption: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taxBracketSchema.index({ country: 1, year: 1, filingStatus: 1 });
taxBracketSchema.index({ country: 1, year: 1, isActive: 1 });

// Method to calculate tax for a given income
taxBracketSchema.methods.calculateTax = function(income) {
  const bracket = this.brackets.find(b => 
    income >= b.minIncome && (b.maxIncome === null || income <= b.maxIncome)
  );
  
  if (!bracket) {
    throw new Error('No matching tax bracket found');
  }

  const taxableIncome = income - this.standardDeduction;
  const excessIncome = taxableIncome - bracket.minIncome;
  const taxOnExcess = excessIncome * (bracket.rate / 100);
  
  return bracket.baseTax + taxOnExcess;
};

const TaxBracket = mongoose.model('TaxBracket', taxBracketSchema);

module.exports = TaxBracket; 