const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all credit cards
router.get('/', async (req, res) => {
  try {
    const cards = await db.all(`
      SELECT cc.*, ba.name as bank_name, ba.currency as bank_currency
      FROM credit_cards cc
      LEFT JOIN bank_accounts ba ON cc.bank_account_id = ba.id
      ORDER BY cc.name
    `);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit cards' });
  }
});

// Get a single credit card
router.get('/:id', async (req, res) => {
  try {
    const card = await db.get(`
      SELECT cc.*, ba.name as bank_name, ba.currency as bank_currency
      FROM credit_cards cc
      LEFT JOIN bank_accounts ba ON cc.bank_account_id = ba.id
      WHERE cc.id = ?
    `, [req.params.id]);

    if (!card) {
      return res.status(404).json({ error: 'Credit card not found' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit card' });
  }
});

// Create a new credit card
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      issuer,
      card_number,
      limit,
      billing_day,
      currency,
      color,
      bank_account_id,
      notes
    } = req.body;
    
    if (!name || !type || !issuer || !card_number || !limit || !billing_day || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank account if provided
    if (bank_account_id) {
      const bankAccount = await db.get(
        'SELECT * FROM bank_accounts WHERE id = ?',
        [bank_account_id]
      );
      if (!bankAccount) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }

    const result = await db.run(
      `INSERT INTO credit_cards 
       (name, type, issuer, card_number, limit, billing_day, currency, color, bank_account_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, issuer, card_number, limit, billing_day, currency, color || '#8B5CF6', bank_account_id, notes]
    );

    const card = await db.get(`
      SELECT cc.*, ba.name as bank_name, ba.currency as bank_currency
      FROM credit_cards cc
      LEFT JOIN bank_accounts ba ON cc.bank_account_id = ba.id
      WHERE cc.id = ?
    `, [result.lastID]);

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create credit card' });
  }
});

// Update a credit card
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      issuer,
      card_number,
      limit,
      billing_day,
      currency,
      color,
      bank_account_id,
      notes
    } = req.body;
    
    if (!name || !type || !issuer || !card_number || !limit || !billing_day || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank account if provided
    if (bank_account_id) {
      const bankAccount = await db.get(
        'SELECT * FROM bank_accounts WHERE id = ?',
        [bank_account_id]
      );
      if (!bankAccount) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }

    await db.run(
      `UPDATE credit_cards 
       SET name = ?, type = ?, issuer = ?, card_number = ?, limit = ?,
           billing_day = ?, currency = ?, color = ?, bank_account_id = ?, notes = ?
       WHERE id = ?`,
      [name, type, issuer, card_number, limit, billing_day, currency, color, bank_account_id, notes, req.params.id]
    );

    const card = await db.get(`
      SELECT cc.*, ba.name as bank_name, ba.currency as bank_currency
      FROM credit_cards cc
      LEFT JOIN bank_accounts ba ON cc.bank_account_id = ba.id
      WHERE cc.id = ?
    `, [req.params.id]);

    if (!card) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update credit card' });
  }
});

// Delete a credit card
router.delete('/:id', async (req, res) => {
  try {
    const card = await db.get('SELECT * FROM credit_cards WHERE id = ?', [req.params.id]);
    if (!card) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    // Check if card has any transactions
    const transactions = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE card_id = ?',
      [req.params.id]
    );

    if (transactions.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete credit card with existing transactions'
      });
    }

    await db.run('DELETE FROM credit_cards WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete credit card' });
  }
});

// Get card statement
router.get('/:id/statement', async (req, res) => {
  try {
    const card = await db.get('SELECT * FROM credit_cards WHERE id = ?', [req.params.id]);
    if (!card) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const transactions = await db.all(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.card_id = ? 
      AND t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `, [req.params.id, start_date, end_date]);

    // Calculate total spent
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      card,
      transactions,
      total_spent: totalSpent,
      available_credit: card.limit - totalSpent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch card statement' });
  }
});

module.exports = router; 