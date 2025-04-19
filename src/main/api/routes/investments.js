const express = require('express');
const router = express.Router();
const Database = require('../../database/init');
const axios = require('axios');

// Get all investments with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, currency, linked_to } = req.query;
    
    let query = `
      SELECT i.*, 
             s.name as saving_goal_name,
             b.name as business_name
      FROM investments i
      LEFT JOIN saving_goals s ON i.linked_saving_goal_id = s.id
      LEFT JOIN businesses b ON i.linked_business_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND i.type = ?';
      params.push(type);
    }
    if (currency) {
      query += ' AND i.currency = ?';
      params.push(currency);
    }
    if (linked_to === 'saving_goal') {
      query += ' AND i.linked_saving_goal_id IS NOT NULL';
    } else if (linked_to === 'business') {
      query += ' AND i.linked_business_id IS NOT NULL';
    }

    const investments = await db.all(query, params);
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Get a single investment
router.get('/:id', async (req, res) => {
  try {
    const investment = await db.get(`
      SELECT i.*, 
             s.name as saving_goal_name,
             b.name as business_name
      FROM investments i
      LEFT JOIN saving_goals s ON i.linked_saving_goal_id = s.id
      LEFT JOIN businesses b ON i.linked_business_id = b.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

// Create a new investment
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      amount,
      currency,
      purchase_date,
      current_value,
      linked_saving_goal_id,
      linked_business_id,
      notes
    } = req.body;

    if (!name || !type || !amount || !currency || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate linked entities
    if (linked_saving_goal_id) {
      const savingGoal = await db.get('SELECT * FROM saving_goals WHERE id = ?', [linked_saving_goal_id]);
      if (!savingGoal) {
        return res.status(400).json({ error: 'Invalid saving goal' });
      }
    }
    if (linked_business_id) {
      const business = await db.get('SELECT * FROM businesses WHERE id = ?', [linked_business_id]);
      if (!business) {
        return res.status(400).json({ error: 'Invalid business' });
      }
    }

    const result = await db.run(
      `INSERT INTO investments 
       (name, type, amount, currency, purchase_date, current_value, 
        linked_saving_goal_id, linked_business_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, amount, currency, purchase_date, current_value || amount,
       linked_saving_goal_id, linked_business_id, notes]
    );

    const investment = await db.get(`
      SELECT i.*, 
             s.name as saving_goal_name,
             b.name as business_name
      FROM investments i
      LEFT JOIN saving_goals s ON i.linked_saving_goal_id = s.id
      LEFT JOIN businesses b ON i.linked_business_id = b.id
      WHERE i.id = ?
    `, [result.lastID]);

    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// Update an investment
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      amount,
      currency,
      purchase_date,
      current_value,
      linked_saving_goal_id,
      linked_business_id,
      notes
    } = req.body;

    if (!name || !type || !amount || !currency || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate linked entities
    if (linked_saving_goal_id) {
      const savingGoal = await db.get('SELECT * FROM saving_goals WHERE id = ?', [linked_saving_goal_id]);
      if (!savingGoal) {
        return res.status(400).json({ error: 'Invalid saving goal' });
      }
    }
    if (linked_business_id) {
      const business = await db.get('SELECT * FROM businesses WHERE id = ?', [linked_business_id]);
      if (!business) {
        return res.status(400).json({ error: 'Invalid business' });
      }
    }

    await db.run(
      `UPDATE investments 
       SET name = ?, type = ?, amount = ?, currency = ?, purchase_date = ?,
           current_value = ?, linked_saving_goal_id = ?, linked_business_id = ?, notes = ?
       WHERE id = ?`,
      [name, type, amount, currency, purchase_date, current_value,
       linked_saving_goal_id, linked_business_id, notes, req.params.id]
    );

    const investment = await db.get(`
      SELECT i.*, 
             s.name as saving_goal_name,
             b.name as business_name
      FROM investments i
      LEFT JOIN saving_goals s ON i.linked_saving_goal_id = s.id
      LEFT JOIN businesses b ON i.linked_business_id = b.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// Delete an investment
router.delete('/:id', async (req, res) => {
  try {
    const investment = await db.get('SELECT * FROM investments WHERE id = ?', [req.params.id]);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    await db.run('DELETE FROM investments WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// Update investment value from external API
router.post('/:id/update-value', async (req, res) => {
  try {
    const investment = await db.get('SELECT * FROM investments WHERE id = ?', [req.params.id]);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    let newValue;
    switch (investment.type) {
      case 'crypto':
        // Use CoinGecko API for crypto prices
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${investment.name}&vs_currencies=${investment.currency}`);
        newValue = response.data[investment.name][investment.currency.toLowerCase()] * investment.amount;
        break;
      case 'stock':
        // Use Alpha Vantage API for stock prices
        const stockResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${investment.name}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
        newValue = stockResponse.data['Global Quote']['05. price'] * investment.amount;
        break;
      case 'real_estate':
        // For real estate, we'll need a different API or manual update
        return res.status(400).json({ error: 'Real estate values must be updated manually' });
      default:
        return res.status(400).json({ error: 'Unsupported investment type' });
    }

    await db.run(
      'UPDATE investments SET current_value = ? WHERE id = ?',
      [newValue, req.params.id]
    );

    res.json({ 
      success: true,
      new_value: newValue,
      currency: investment.currency
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment value' });
  }
});

// Get investment performance
router.get('/:id/performance', async (req, res) => {
  try {
    const investment = await db.get('SELECT * FROM investments WHERE id = ?', [req.params.id]);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const performance = {
      initial_investment: investment.amount,
      current_value: investment.current_value,
      currency: investment.currency,
      purchase_date: investment.purchase_date,
      total_return: investment.current_value - investment.amount,
      return_percentage: ((investment.current_value - investment.amount) / investment.amount) * 100
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate investment performance' });
  }
});

module.exports = router; 