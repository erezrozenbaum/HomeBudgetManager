const express = require('express');
const router = express.Router();
const Stock = require('../models/stock');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const stockService = require('../services/stockService');

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Get stock details
router.get('/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

// Add new stock (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { symbol } = req.body;
    
    // Check if stock already exists
    const existingStock = await Stock.findBySymbol(symbol);
    if (existingStock) {
      return res.status(400).json({ error: 'Stock already exists' });
    }

    // Fetch stock data from external API
    const stockData = await stockService.fetchStockData(symbol);
    
    // Create new stock
    const stock = new Stock(stockData);
    await stock.save();

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Update stock data (admin only)
router.put('/:symbol', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Fetch latest data
    const stockData = await stockService.fetchStockData(req.params.symbol);
    
    // Update stock
    Object.assign(stock, stockData);
    await stock.save();

    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Follow/unfollow stock
router.post('/:symbol/follow', isAuthenticated, async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const userId = req.user._id;
    const isFollowing = stock.followers.includes(userId);

    if (isFollowing) {
      await stock.removeFollower(userId);
      res.json({ message: 'Unfollowed stock successfully' });
    } else {
      await stock.addFollower(userId);
      res.json({ message: 'Followed stock successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update follow status' });
  }
});

// Get stock price history
router.get('/:symbol/history', async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const { period } = req.query;
    let history = stock.priceHistory;

    // Filter by period if specified
    if (period) {
      const now = new Date();
      const cutoff = new Date(now - period * 24 * 60 * 60 * 1000);
      history = history.filter(h => h.date >= cutoff);
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Get stock news
router.get('/:symbol/news', async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(stock.news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get AI analysis
router.get('/:symbol/analysis', async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(stock.aiAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI analysis' });
  }
});

// Get investment opportunities
router.get('/opportunities', isAuthenticated, async (req, res) => {
  try {
    const opportunities = await stockService.checkInvestmentOpportunities();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment opportunities' });
  }
});

// Set stock alert
router.post('/:symbol/alerts', isAuthenticated, async (req, res) => {
  try {
    const stock = await Stock.findBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const alertData = {
      userId: req.user._id,
      ...req.body
    };

    await stock.addAlert(alertData);
    res.status(201).json({ message: 'Alert created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Get user's followed stocks
router.get('/user/followed', isAuthenticated, async (req, res) => {
  try {
    const stocks = await Stock.find({ followers: req.user._id });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch followed stocks' });
  }
});

module.exports = router; 