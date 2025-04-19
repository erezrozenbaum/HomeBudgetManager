const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all insurances
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = `
      SELECT i.*, 
             ba.name as bank_account_name,
             ba.currency as bank_account_currency
      FROM insurances i
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND i.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.next_payment_date ASC';
    const insurances = await db.all(query, params);
    res.json(insurances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurances' });
  }
});

// Get a single insurance
router.get('/:id', async (req, res) => {
  try {
    const insurance = await db.get(`
      SELECT i.*, 
             ba.name as bank_account_name,
             ba.currency as bank_account_currency
      FROM insurances i
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance' });
  }
});

// Create a new insurance
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      provider,
      policy_number,
      amount,
      currency,
      frequency,
      start_date,
      end_date,
      bank_account_id,
      notes
    } = req.body;

    if (!name || !type || !provider || !policy_number || !amount || !currency || !frequency || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank account
    if (bank_account_id) {
      const bankAccount = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [bank_account_id]);
      if (!bankAccount) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }

    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(start_date, frequency);

    const result = await db.run(
      `INSERT INTO insurances 
       (name, type, provider, policy_number, amount, currency, frequency,
        start_date, end_date, next_payment_date, bank_account_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, provider, policy_number, amount, currency, frequency,
       start_date, end_date, nextPaymentDate, bank_account_id, notes]
    );

    const insurance = await db.get(`
      SELECT i.*, 
             ba.name as bank_account_name,
             ba.currency as bank_account_currency
      FROM insurances i
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      WHERE i.id = ?
    `, [result.lastID]);

    res.status(201).json(insurance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create insurance' });
  }
});

// Update an insurance
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      provider,
      policy_number,
      amount,
      currency,
      frequency,
      start_date,
      end_date,
      bank_account_id,
      notes
    } = req.body;

    if (!name || !type || !provider || !policy_number || !amount || !currency || !frequency || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank account
    if (bank_account_id) {
      const bankAccount = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [bank_account_id]);
      if (!bankAccount) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }

    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(start_date, frequency);

    await db.run(
      `UPDATE insurances 
       SET name = ?, type = ?, provider = ?, policy_number = ?, amount = ?, currency = ?,
           frequency = ?, start_date = ?, end_date = ?, next_payment_date = ?,
           bank_account_id = ?, notes = ?
       WHERE id = ?`,
      [name, type, provider, policy_number, amount, currency, frequency,
       start_date, end_date, nextPaymentDate, bank_account_id, notes, req.params.id]
    );

    const insurance = await db.get(`
      SELECT i.*, 
             ba.name as bank_account_name,
             ba.currency as bank_account_currency
      FROM insurances i
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update insurance' });
  }
});

// Delete an insurance
router.delete('/:id', async (req, res) => {
  try {
    const insurance = await db.get('SELECT * FROM insurances WHERE id = ?', [req.params.id]);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    await db.run('DELETE FROM insurances WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete insurance' });
  }
});

// Record an insurance payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, date, notes } = req.body;
    
    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }

    const insurance = await db.get('SELECT * FROM insurances WHERE id = ?', [req.params.id]);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    const result = await db.run(
      `INSERT INTO insurance_payments 
       (insurance_id, amount, date, notes)
       VALUES (?, ?, ?, ?)`,
      [req.params.id, amount, date, notes]
    );

    // Update next payment date
    const nextPaymentDate = calculateNextPaymentDate(date, insurance.frequency);
    await db.run(
      'UPDATE insurances SET next_payment_date = ? WHERE id = ?',
      [nextPaymentDate, req.params.id]
    );

    res.status(201).json({
      success: true,
      payment_id: result.lastID,
      next_payment_date: nextPaymentDate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record insurance payment' });
  }
});

// Get insurance payments
router.get('/:id/payments', async (req, res) => {
  try {
    const insurance = await db.get('SELECT * FROM insurances WHERE id = ?', [req.params.id]);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    const payments = await db.all(
      'SELECT * FROM insurance_payments WHERE insurance_id = ? ORDER BY date DESC',
      [req.params.id]
    );

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance payments' });
  }
});

// Helper function to calculate next payment date
function calculateNextPaymentDate(startDate, frequency) {
  const date = new Date(startDate);
  switch (frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semi_annual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  return date.toISOString().split('T')[0];
}

module.exports = router; 