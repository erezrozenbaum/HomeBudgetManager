const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  autoPay: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'pending', 'failed']
    },
    method: {
      type: String,
      required: true,
      enum: ['auto', 'manual']
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
billSchema.index({ user: 1, dueDate: 1 });
billSchema.index({ user: 1, isActive: 1 });

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill; 