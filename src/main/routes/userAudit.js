const express = require('express');
const router = express.Router();
const UserAudit = require('../models/userAudit');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get user's own audit log
router.get('/my-actions', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const actions = await UserAudit.getUserActions(req.user._id, startDate, endDate);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving audit log', error: error.message });
  }
});

// Admin route to get all user actions
router.get('/all-actions', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const actions = await UserAudit.find(query)
      .sort({ timestamp: -1 })
      .populate('userId', 'username email')
      .lean();
      
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving audit log', error: error.message });
  }
});

// Get recent actions (admin only)
router.get('/recent', [auth, admin], async (req, res) => {
  try {
    const { limit } = req.query;
    const actions = await UserAudit.getRecentActions(parseInt(limit) || 100);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recent actions', error: error.message });
  }
});

module.exports = router; 