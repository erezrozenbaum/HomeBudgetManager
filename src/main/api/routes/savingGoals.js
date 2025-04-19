const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all saving goals
router.get('/', async (req, res) => {
  try {
    const { status, currency } = req.query;
    
    let query = `
      SELECT sg.*, 
             COUNT(i.id) as linked_investments_count,
             SUM(i.current_value) as total_invested
      FROM saving_goals sg
      LEFT JOIN investments i ON i.linked_saving_goal_id = sg.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND sg.status = ?';
      params.push(status);
    }
    if (currency) {
      query += ' AND sg.currency = ?';
      params.push(currency);
    }

    query += ' GROUP BY sg.id ORDER BY sg.target_date ASC';
    const goals = await db.all(query, params);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saving goals' });
  }
});

// Get a single saving goal
router.get('/:id', async (req, res) => {
  try {
    const goal = await db.get(`
      SELECT sg.*, 
             COUNT(i.id) as linked_investments_count,
             SUM(i.current_value) as total_invested
      FROM saving_goals sg
      LEFT JOIN investments i ON i.linked_saving_goal_id = sg.id
      WHERE sg.id = ?
      GROUP BY sg.id
    `, [req.params.id]);

    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saving goal' });
  }
});

// Create a new saving goal
router.post('/', async (req, res) => {
  try {
    const {
      name,
      target_amount,
      currency,
      target_date,
      current_amount,
      notes
    } = req.body;

    if (!name || !target_amount || !currency || !target_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate status based on current amount and target date
    const status = calculateGoalStatus(target_amount, current_amount || 0, target_date);

    const result = await db.run(
      `INSERT INTO saving_goals 
       (name, target_amount, currency, target_date, current_amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, target_amount, currency, target_date, current_amount || 0, status, notes]
    );

    const goal = await db.get(`
      SELECT sg.*, 
             COUNT(i.id) as linked_investments_count,
             SUM(i.current_value) as total_invested
      FROM saving_goals sg
      LEFT JOIN investments i ON i.linked_saving_goal_id = sg.id
      WHERE sg.id = ?
      GROUP BY sg.id
    `, [result.lastID]);

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create saving goal' });
  }
});

// Update a saving goal
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      target_amount,
      currency,
      target_date,
      current_amount,
      notes
    } = req.body;

    if (!name || !target_amount || !currency || !target_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate status based on current amount and target date
    const status = calculateGoalStatus(target_amount, current_amount || 0, target_date);

    await db.run(
      `UPDATE saving_goals 
       SET name = ?, target_amount = ?, currency = ?, target_date = ?,
           current_amount = ?, status = ?, notes = ?
       WHERE id = ?`,
      [name, target_amount, currency, target_date, current_amount || 0, status, notes, req.params.id]
    );

    const goal = await db.get(`
      SELECT sg.*, 
             COUNT(i.id) as linked_investments_count,
             SUM(i.current_value) as total_invested
      FROM saving_goals sg
      LEFT JOIN investments i ON i.linked_saving_goal_id = sg.id
      WHERE sg.id = ?
      GROUP BY sg.id
    `, [req.params.id]);

    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update saving goal' });
  }
});

// Delete a saving goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await db.get('SELECT * FROM saving_goals WHERE id = ?', [req.params.id]);
    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    // Check for linked investments
    const investments = await db.all('SELECT * FROM investments WHERE linked_saving_goal_id = ?', [req.params.id]);
    if (investments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete saving goal with linked investments',
        investments_count: investments.length
      });
    }

    await db.run('DELETE FROM saving_goals WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete saving goal' });
  }
});

// Add amount to saving goal
router.post('/:id/add', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const goal = await db.get('SELECT * FROM saving_goals WHERE id = ?', [req.params.id]);
    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    const newAmount = goal.current_amount + amount;
    const status = calculateGoalStatus(goal.target_amount, newAmount, goal.target_date);

    await db.run(
      'UPDATE saving_goals SET current_amount = ?, status = ? WHERE id = ?',
      [newAmount, status, req.params.id]
    );

    res.json({
      success: true,
      new_amount: newAmount,
      status: status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add amount to saving goal' });
  }
});

// Get saving goal progress
router.get('/:id/progress', async (req, res) => {
  try {
    const goal = await db.get('SELECT * FROM saving_goals WHERE id = ?', [req.params.id]);
    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    const progress = {
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      currency: goal.currency,
      percentage: (goal.current_amount / goal.target_amount) * 100,
      days_remaining: Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)),
      status: goal.status
    };

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate saving goal progress' });
  }
});

// Helper function to calculate goal status
function calculateGoalStatus(targetAmount, currentAmount, targetDate) {
  const percentage = (currentAmount / targetAmount) * 100;
  const daysRemaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  const requiredDailySaving = (targetAmount - currentAmount) / daysRemaining;

  if (percentage >= 100) {
    return 'completed';
  } else if (daysRemaining <= 0) {
    return 'overdue';
  } else if (percentage >= 75) {
    return 'on_track';
  } else if (percentage >= 50) {
    return 'needs_attention';
  } else {
    return 'off_track';
  }
}

module.exports = router; 