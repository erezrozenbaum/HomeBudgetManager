const mongoose = require('mongoose');

const liabilitySchema = new mongoose.Schema({
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
    enum: ['loan', 'credit_card', 'mortgage', 'other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  minimumPayment: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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
    payment: {
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
liabilitySchema.index({ user: 1, type: 1 });
liabilitySchema.index({ user: 1, isActive: 1 });

const Liability = mongoose.model('Liability', liabilitySchema);

module.exports = Liability; 