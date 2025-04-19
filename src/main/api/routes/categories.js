const express = require('express');
const router = express.Router();
const Database = require('../../database/init');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT c.*, 
             p.name as parent_name,
             p.color as parent_color
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
    `;
    const params = [];

    if (type) {
      query += ' WHERE c.type = ?';
      params.push(type);
    }

    query += ' ORDER BY c.type, c.name';
    const categories = await db.all(query, params);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get a single category
router.get('/:id', async (req, res) => {
  try {
    const category = await db.get(`
      SELECT c.*, 
             p.name as parent_name,
             p.color as parent_color
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, type, color, icon, parent_id } = req.body;
    
    if (!name || !type || !color) {
      return res.status(400).json({ error: 'Name, type, and color are required' });
    }

    // Validate type
    if (!['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'Invalid category type' });
    }

    // Validate parent if provided
    if (parent_id) {
      const parent = await db.get('SELECT * FROM categories WHERE id = ?', [parent_id]);
      if (!parent) {
        return res.status(400).json({ error: 'Invalid parent category' });
      }
      if (parent.type !== type) {
        return res.status(400).json({ error: 'Parent category must be of the same type' });
      }
    }

    const result = await db.run(
      `INSERT INTO categories (name, type, color, icon, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, color, icon, parent_id]
    );

    const category = await db.get(`
      SELECT c.*, 
             p.name as parent_name,
             p.color as parent_color
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, type, color, icon, parent_id } = req.body;
    
    if (!name || !type || !color) {
      return res.status(400).json({ error: 'Name, type, and color are required' });
    }

    // Validate type
    if (!['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'Invalid category type' });
    }

    // Validate parent if provided
    if (parent_id) {
      const parent = await db.get('SELECT * FROM categories WHERE id = ?', [parent_id]);
      if (!parent) {
        return res.status(400).json({ error: 'Invalid parent category' });
      }
      if (parent.type !== type) {
        return res.status(400).json({ error: 'Parent category must be of the same type' });
      }
    }

    await db.run(
      `UPDATE categories 
       SET name = ?, type = ?, color = ?, icon = ?, parent_id = ?
       WHERE id = ?`,
      [name, type, color, icon, parent_id, req.params.id]
    );

    const category = await db.get(`
      SELECT c.*, 
             p.name as parent_name,
             p.color as parent_color
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has any transactions
    const transactions = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [req.params.id]
    );

    if (transactions.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing transactions'
      });
    }

    // Check if category has any subcategories
    const subcategories = await db.get(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [req.params.id]
    );

    if (subcategories.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing subcategories'
      });
    }

    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get category statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get transactions for this category
    const transactions = await db.all(`
      SELECT t.*, 
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.category_id = ?
      AND t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `, [req.params.id, start_date || '1900-01-01', end_date || '2100-12-31']);

    // Calculate statistics
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
    const recurringCount = transactions.filter(t => t.is_recurring).length;
    const unplannedCount = transactions.filter(t => t.is_unplanned).length;

    res.json({
      category,
      statistics: {
        total_transactions: transactions.length,
        total_amount: totalAmount,
        average_amount: averageAmount,
        recurring_count: recurringCount,
        unplanned_count: unplannedCount,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

 