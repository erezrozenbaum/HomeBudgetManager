const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all bank accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await db.all('SELECT * FROM bank_accounts ORDER BY name');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

// Get a single bank account
router.get('/:id', async (req, res) => {
  try {
    const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [req.params.id]);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank account' });
  }
});

// Create a new bank account
router.post('/', async (req, res) => {
  try {
    const { name, branch, account_number, currency, initial_balance, color, notes } = req.body;
    
    if (!name || !currency) {
      return res.status(400).json({ error: 'Name and currency are required' });
    }

    const result = await db.run(
      `INSERT INTO bank_accounts 
       (name, branch, account_number, currency, initial_balance, current_balance, color, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, branch, account_number, currency, initial_balance || 0, initial_balance || 0, color || '#3B82F6', notes]
    );

    const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [result.lastID]);
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank account' });
  }
});

// Update a bank account
router.put('/:id', async (req, res) => {
  try {
    const { name, branch, account_number, currency, color, notes } = req.body;
    
    if (!name || !currency) {
      return res.status(400).json({ error: 'Name and currency are required' });
    }

    await db.run(
      `UPDATE bank_accounts 
       SET name = ?, branch = ?, account_number = ?, currency = ?, color = ?, notes = ?
       WHERE id = ?`,
      [name, branch, account_number, currency, color, notes, req.params.id]
    );

    const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [req.params.id]);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank account' });
  }
});

// Delete a bank account
router.delete('/:id', async (req, res) => {
  try {
    const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [req.params.id]);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Check if account has any transactions
    const transactions = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?',
      [req.params.id]
    );

    if (transactions.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete bank account with existing transactions'
      });
    }

    await db.run('DELETE FROM bank_accounts WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
});

// Get account balance
router.get('/:id/balance', async (req, res) => {
  try {
    const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [req.params.id]);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Calculate current balance from transactions
    const transactions = await db.all(
      `SELECT amount, currency 
       FROM transactions 
       WHERE account_id = ? 
       ORDER BY date DESC`,
      [req.params.id]
    );

    let balance = account.initial_balance;
    for (const transaction of transactions) {
      // TODO: Add currency conversion logic
      balance += transaction.amount;
    }

    res.json({
      initial_balance: account.initial_balance,
      current_balance: balance,
      currency: account.currency
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate account balance' });
  }
});

module.exports = router; 