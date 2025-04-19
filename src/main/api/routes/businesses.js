const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = `
      SELECT b.*, 
             COUNT(bu.id) as user_count,
             COUNT(i.id) as investment_count
      FROM businesses b
      LEFT JOIN business_users bu ON b.id = bu.business_id
      LEFT JOIN investments i ON i.linked_business_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND b.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' GROUP BY b.id ORDER BY b.name ASC';
    const businesses = await db.all(query, params);
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get a single business
router.get('/:id', async (req, res) => {
  try {
    const business = await db.get(`
      SELECT b.*, 
             COUNT(bu.id) as user_count,
             COUNT(i.id) as investment_count
      FROM businesses b
      LEFT JOIN business_users bu ON b.id = bu.business_id
      LEFT JOIN investments i ON i.linked_business_id = b.id
      WHERE b.id = ?
      GROUP BY b.id
    `, [req.params.id]);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Create a new business
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      registration_number,
      tax_id,
      address,
      phone,
      email,
      website,
      currency,
      notes
    } = req.body;

    if (!name || !type || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      `INSERT INTO businesses 
       (name, type, registration_number, tax_id, address, phone, email,
        website, currency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, registration_number, tax_id, address, phone, email,
       website, currency, notes]
    );

    const business = await db.get(`
      SELECT b.*, 
             COUNT(bu.id) as user_count,
             COUNT(i.id) as investment_count
      FROM businesses b
      LEFT JOIN business_users bu ON b.id = bu.business_id
      LEFT JOIN investments i ON i.linked_business_id = b.id
      WHERE b.id = ?
      GROUP BY b.id
    `, [result.lastID]);

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Update a business
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      registration_number,
      tax_id,
      address,
      phone,
      email,
      website,
      currency,
      notes
    } = req.body;

    if (!name || !type || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.run(
      `UPDATE businesses 
       SET name = ?, type = ?, registration_number = ?, tax_id = ?, address = ?,
           phone = ?, email = ?, website = ?, currency = ?, notes = ?
       WHERE id = ?`,
      [name, type, registration_number, tax_id, address, phone, email,
       website, currency, notes, req.params.id]
    );

    const business = await db.get(`
      SELECT b.*, 
             COUNT(bu.id) as user_count,
             COUNT(i.id) as investment_count
      FROM businesses b
      LEFT JOIN business_users bu ON b.id = bu.business_id
      LEFT JOIN investments i ON i.linked_business_id = b.id
      WHERE b.id = ?
      GROUP BY b.id
    `, [req.params.id]);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete a business
router.delete('/:id', async (req, res) => {
  try {
    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check for linked investments
    const investments = await db.all('SELECT * FROM investments WHERE linked_business_id = ?', [req.params.id]);
    if (investments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete business with linked investments',
        investments_count: investments.length
      });
    }

    // Delete business users first
    await db.run('DELETE FROM business_users WHERE business_id = ?', [req.params.id]);
    
    // Then delete the business
    await db.run('DELETE FROM businesses WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// Add a user to a business
router.post('/:id/users', async (req, res) => {
  try {
    const { name, role, email, phone, notes } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const result = await db.run(
      `INSERT INTO business_users 
       (business_id, name, role, email, phone, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, name, role, email, phone, notes]
    );

    res.status(201).json({
      success: true,
      user_id: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user to business' });
  }
});

// Get business users
router.get('/:id/users', async (req, res) => {
  try {
    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const users = await db.all(
      'SELECT * FROM business_users WHERE business_id = ? ORDER BY name ASC',
      [req.params.id]
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business users' });
  }
});

// Update a business user
router.put('/:id/users/:userId', async (req, res) => {
  try {
    const { name, role, email, phone, notes } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await db.run(
      `UPDATE business_users 
       SET name = ?, role = ?, email = ?, phone = ?, notes = ?
       WHERE id = ? AND business_id = ?`,
      [name, role, email, phone, notes, req.params.userId, req.params.id]
    );

    const user = await db.get(
      'SELECT * FROM business_users WHERE id = ? AND business_id = ?',
      [req.params.userId, req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Business user not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update business user' });
  }
});

// Remove a user from a business
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await db.run(
      'DELETE FROM business_users WHERE id = ? AND business_id = ?',
      [req.params.userId, req.params.id]
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove user from business' });
  }
});

// Get business financial summary
router.get('/:id/financials', async (req, res) => {
  try {
    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Get total investments
    const investments = await db.all(
      'SELECT SUM(current_value) as total FROM investments WHERE linked_business_id = ?',
      [req.params.id]
    );

    // Get total transactions
    const transactions = await db.all(`
      SELECT 
        SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) as total_expenses
      FROM transactions t
      WHERE t.business_id = ?
    `, [req.params.id]);

    const summary = {
      total_investments: investments[0].total || 0,
      total_income: transactions[0].total_income || 0,
      total_expenses: transactions[0].total_expenses || 0,
      net_profit: (transactions[0].total_income || 0) + (transactions[0].total_expenses || 0),
      currency: business.currency
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate business financials' });
  }
});

module.exports = router; 