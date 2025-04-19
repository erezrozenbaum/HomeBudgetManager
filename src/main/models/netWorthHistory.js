const mongoose = require('mongoose');

const netWorthHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalAssets: {
    type: Number,
    required: true,
    min: 0
  },
  totalLiabilities: {
    type: Number,
    required: true,
    min: 0
  },
  netWorth: {
    type: Number,
    required: true
  },
  assetsByType: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  liabilitiesByType: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
netWorthHistorySchema.index({ user: 1, date: 1 });
netWorthHistorySchema.index({ user: 1, date: -1 });

const NetWorthHistory = mongoose.model('NetWorthHistory', netWorthHistorySchema);

module.exports = NetWorthHistory; 