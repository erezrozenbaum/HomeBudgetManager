const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    required: true
  },
  sector: String,
  industry: String,
  currentPrice: {
    type: Number,
    required: true
  },
  previousClose: Number,
  marketCap: Number,
  peRatio: Number,
  dividendYield: Number,
  priceHistory: [{
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  }],
  technicalIndicators: {
    sma50: Number,
    sma200: Number,
    rsi: Number,
    macd: {
      value: Number,
      signal: Number,
      histogram: Number
    }
  },
  news: [{
    date: Date,
    title: String,
    source: String,
    url: String,
    summary: String,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  }],
  aiAnalysis: {
    shortTermOutlook: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral']
    },
    longTermOutlook: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral']
    },
    confidence: Number,
    keyFactors: [String],
    recommendation: String,
    lastUpdated: Date
  },
  alerts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['price', 'volume', 'technical', 'news', 'ai'],
      required: true
    },
    condition: {
      type: String,
      required: true
    },
    value: mongoose.Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
stockSchema.index({ symbol: 1 });
stockSchema.index({ followers: 1 });
stockSchema.index({ 'priceHistory.date': 1 });

// Static methods
stockSchema.statics.findBySymbol = function(symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

stockSchema.statics.findBySector = function(sector) {
  return this.find({ sector });
};

stockSchema.statics.findByIndustry = function(industry) {
  return this.find({ industry });
};

// Instance methods
stockSchema.methods.addPriceHistory = function(priceData) {
  this.priceHistory.push(priceData);
  return this.save();
};

stockSchema.methods.addNews = function(newsData) {
  this.news.push(newsData);
  return this.save();
};

stockSchema.methods.updateTechnicalIndicators = function(indicators) {
  this.technicalIndicators = indicators;
  return this.save();
};

stockSchema.methods.updateAIAnalysis = function(analysis) {
  this.aiAnalysis = {
    ...analysis,
    lastUpdated: new Date()
  };
  return this.save();
};

stockSchema.methods.addAlert = function(alertData) {
  this.alerts.push(alertData);
  return this.save();
};

stockSchema.methods.removeAlert = function(alertId) {
  this.alerts = this.alerts.filter(alert => alert._id.toString() !== alertId);
  return this.save();
};

stockSchema.methods.addFollower = function(userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
  }
  return this.save();
};

stockSchema.methods.removeFollower = function(userId) {
  this.followers = this.followers.filter(id => id.toString() !== userId.toString());
  return this.save();
};

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock; 