const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  email: {
    type: Boolean,
    default: true
  },
  push: {
    type: Boolean,
    default: true
  },
  sms: {
    type: Boolean,
    default: false
  },
  budgetAlerts: {
    type: Boolean,
    default: true
  },
  billReminders: {
    type: Boolean,
    default: true
  },
  goalUpdates: {
    type: Boolean,
    default: true
  },
  debtReminders: {
    type: Boolean,
    default: true
  },
  taxDeadlines: {
    type: Boolean,
    default: true
  },
  investmentUpdates: {
    type: Boolean,
    default: true
  },
  customAlerts: [{
    type: {
      type: String,
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
notificationSettingsSchema.index({ user: 1 });

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings; 