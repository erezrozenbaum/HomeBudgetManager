const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const RecurringTransaction = require('../models/recurringTransaction');
const UnplannedTransaction = require('../models/unplannedTransaction');
const BusinessTransaction = require('../models/businessTransaction');
const auth = require('../middleware/auth');

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id
    });
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recurring transactions
router.get('/recurring', auth, async (req, res) => {
  try {
    const transactions = await Transaction.getRecurringTransactions(req.user._id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unplanned transactions
router.get('/unplanned', auth, async (req, res) => {
  try {
    const transactions = await Transaction.getUnplannedTransactions(req.user._id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get business transactions
router.get('/business', auth, async (req, res) => {
  try {
    const transactions = await Transaction.getBusinessTransactions(req.user._id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transactions by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactions = await Transaction.getByType(
      req.user._id,
      req.params.type,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create recurring transaction
router.post('/recurring', auth, async (req, res) => {
  try {
    const recurringTransaction = new RecurringTransaction({
      ...req.body,
      user: req.user._id
    });
    const savedRecurringTransaction = await recurringTransaction.save();
    
    // Create the initial transaction
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id,
      isRecurring: true,
      recurringTransaction: savedRecurringTransaction._id
    });
    const savedTransaction = await transaction.save();
    
    res.status(201).json({
      recurringTransaction: savedRecurringTransaction,
      transaction: savedTransaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create unplanned transaction
router.post('/unplanned', auth, async (req, res) => {
  try {
    const unplannedTransaction = new UnplannedTransaction({
      ...req.body,
      user: req.user._id
    });
    const savedUnplannedTransaction = await unplannedTransaction.save();
    
    // Create the transaction
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id,
      isUnplanned: true,
      unplannedTransaction: savedUnplannedTransaction._id
    });
    const savedTransaction = await transaction.save();
    
    res.status(201).json({
      unplannedTransaction: savedUnplannedTransaction,
      transaction: savedTransaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create business transaction
router.post('/business', auth, async (req, res) => {
  try {
    const businessTransaction = new BusinessTransaction({
      ...req.body,
      user: req.user._id
    });
    const savedBusinessTransaction = await businessTransaction.save();
    
    // Create the transaction
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id,
      isBusiness: true,
      businessTransaction: savedBusinessTransaction._id
    });
    const savedTransaction = await transaction.save();
    
    res.status(201).json({
      businessTransaction: savedBusinessTransaction,
      transaction: savedTransaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 