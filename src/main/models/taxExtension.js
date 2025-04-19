const mongoose = require('mongoose');

const taxExtensionSchema = new mongoose.Schema({
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
    enum: ['federal', 'state', 'local']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  originalDueDate: {
    type: Date,
    required: true
  },
  extendedDueDate: {
    type: Date,
    required: true
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvalDate: Date,
  reason: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTaxLiability: {
    type: Number,
    required: true,
    min: 0
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxPayment'
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['extension_form', 'supporting_document', 'approval_letter', 'other']
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
  }],
  taxSummary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxSummary'
  },
  jurisdiction: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    contact: {
      phone: String,
      email: String,
      address: String
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taxExtensionSchema.index({ user: 1, year: 1 });
taxExtensionSchema.index({ user: 1, type: 1 });
taxExtensionSchema.index({ user: 1, status: 1 });
taxExtensionSchema.index({ user: 1, extendedDueDate: 1 });

// Method to check if extension is valid
taxExtensionSchema.methods.isValid = function() {
  const now = new Date();
  return this.status === 'approved' && now <= this.extendedDueDate;
};

// Method to calculate days remaining
taxExtensionSchema.methods.daysRemaining = function() {
  if (!this.isValid()) return 0;
  const diffTime = Math.abs(this.extendedDueDate - new Date());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to check if extension is expiring soon
taxExtensionSchema.methods.isExpiringSoon = function(days = 30) {
  if (!this.isValid()) return false;
  return this.daysRemaining() <= days;
};

// Static method to get active extensions
taxExtensionSchema.statics.getActiveExtensions = async function(userId) {
  const now = new Date();
  return this.find({
    user: userId,
    status: 'approved',
    extendedDueDate: { $gt: now }
  }).sort({ extendedDueDate: 1 });
};

// Static method to get expiring extensions
taxExtensionSchema.statics.getExpiringExtensions = async function(userId, days = 30) {
  const now = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + days);

  return this.find({
    user: userId,
    status: 'approved',
    extendedDueDate: { $gt: now, $lte: thresholdDate }
  }).sort({ extendedDueDate: 1 });
};

const TaxExtension = mongoose.model('TaxExtension', taxExtensionSchema);

module.exports = TaxExtension; 