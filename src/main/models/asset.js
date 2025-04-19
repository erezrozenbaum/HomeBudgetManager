const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
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
    enum: ['cash', 'investment', 'property', 'vehicle', 'other']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  description: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number
  },
  appreciationRate: {
    type: Number,
    default: 0
  },
  isLiquid: {
    type: Boolean,
    default: false
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
assetSchema.index({ user: 1, type: 1 });
assetSchema.index({ user: 1, isLiquid: 1 });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset; 