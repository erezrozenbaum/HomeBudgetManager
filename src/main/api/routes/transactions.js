const express = require('express');
const router = express.Router();
const Database = require('../../database/init');
const ExcelJS = require('exceljs');
const { formatDate } = require('../../utils/format');

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      account_id,
      card_id,
      category_id,
      type,
      is_recurring,
      is_unplanned,
      is_entitlement
    } = req.query;

    let query = `
      SELECT t.*, 
             c.name as category_name, 
             c.color as category_color,
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ' AND t.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND t.date <= ?';
      params.push(end_date);
    }
    if (account_id) {
      query += ' AND t.account_id = ?';
      params.push(account_id);
    }
    if (card_id) {
      query += ' AND t.card_id = ?';
      params.push(card_id);
    }
    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }
    if (is_recurring !== undefined) {
      query += ' AND t.is_recurring = ?';
      params.push(is_recurring === 'true');
    }
    if (is_unplanned !== undefined) {
      query += ' AND t.is_unplanned = ?';
      params.push(is_unplanned === 'true');
    }
    if (is_entitlement !== undefined) {
      query += ' AND t.is_entitlement = ?';
      params.push(is_entitlement === 'true');
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    const transactions = await db.all(query, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get a single transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await db.get(`
      SELECT t.*, 
             c.name as category_name, 
             c.color as category_color,
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const {
      date,
      amount,
      currency,
      description,
      category_id,
      account_id,
      card_id,
      is_recurring,
      is_unplanned,
      is_entitlement,
      notes
    } = req.body;

    if (!date || !amount || !currency || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate account or card
    if (account_id) {
      const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [account_id]);
      if (!account) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }
    if (card_id) {
      const card = await db.get('SELECT * FROM credit_cards WHERE id = ?', [card_id]);
      if (!card) {
        return res.status(400).json({ error: 'Invalid credit card' });
      }
    }

    // Validate category
    if (category_id) {
      const category = await db.get('SELECT * FROM categories WHERE id = ?', [category_id]);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    const result = await db.run(
      `INSERT INTO transactions 
       (date, amount, currency, description, category_id, account_id, card_id, 
        is_recurring, is_unplanned, is_entitlement, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, amount, currency, description, category_id, account_id, card_id,
       is_recurring || false, is_unplanned || false, is_entitlement || false, notes]
    );

    const transaction = await db.get(`
      SELECT t.*, 
             c.name as category_name, 
             c.color as category_color,
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.id = ?
    `, [result.lastID]);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const {
      date,
      amount,
      currency,
      description,
      category_id,
      account_id,
      card_id,
      is_recurring,
      is_unplanned,
      is_entitlement,
      notes
    } = req.body;

    if (!date || !amount || !currency || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate account or card
    if (account_id) {
      const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [account_id]);
      if (!account) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }
    if (card_id) {
      const card = await db.get('SELECT * FROM credit_cards WHERE id = ?', [card_id]);
      if (!card) {
        return res.status(400).json({ error: 'Invalid credit card' });
      }
    }

    // Validate category
    if (category_id) {
      const category = await db.get('SELECT * FROM categories WHERE id = ?', [category_id]);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    await db.run(
      `UPDATE transactions 
       SET date = ?, amount = ?, currency = ?, description = ?, category_id = ?,
           account_id = ?, card_id = ?, is_recurring = ?, is_unplanned = ?,
           is_entitlement = ?, notes = ?
       WHERE id = ?`,
      [date, amount, currency, description, category_id, account_id, card_id,
       is_recurring, is_unplanned, is_entitlement, notes, req.params.id]
    );

    const transaction = await db.get(`
      SELECT t.*, 
             c.name as category_name, 
             c.color as category_color,
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.run('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Export transactions to Excel
router.get('/export/excel', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const transactions = await db.all(`
      SELECT t.*, 
             c.name as category_name, 
             c.color as category_color,
             ba.name as account_name,
             cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.account_id = ba.id
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `, [start_date || '1900-01-01', end_date || '2100-12-31']);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category', key: 'category_name', width: 20 },
      { header: 'Account', key: 'account_name', width: 20 },
      { header: 'Card', key: 'card_name', width: 20 },
      { header: 'Recurring', key: 'is_recurring', width: 10 },
      { header: 'Unplanned', key: 'is_unplanned', width: 10 },
      { header: 'Entitlement', key: 'is_entitlement', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    // Add data
    worksheet.addRows(transactions.map(t => ({
      ...t,
      date: formatDate(t.date),
      is_recurring: t.is_recurring ? 'Yes' : 'No',
      is_unplanned: t.is_unplanned ? 'Yes' : 'No',
      is_entitlement: t.is_entitlement ? 'Yes' : 'No'
    })));

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

// Import transactions from Excel
router.post('/import/excel', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.files.file.data);
    const worksheet = workbook.getWorksheet(1);

    const transactions = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        transactions.push({
          date: row.getCell(1).value,
          amount: row.getCell(2).value,
          currency: row.getCell(3).value,
          description: row.getCell(4).value,
          category_name: row.getCell(5).value,
          account_name: row.getCell(6).value,
          card_name: row.getCell(7).value,
          is_recurring: row.getCell(8).value === 'Yes',
          is_unplanned: row.getCell(9).value === 'Yes',
          is_entitlement: row.getCell(10).value === 'Yes',
          notes: row.getCell(11).value
        });
      }
    });

    // Validate and insert transactions
    const results = [];
    for (const t of transactions) {
      try {
        // Get category ID
        const category = await db.get(
          'SELECT id FROM categories WHERE name = ?',
          [t.category_name]
        );

        // Get account ID
        const account = await db.get(
          'SELECT id FROM bank_accounts WHERE name = ?',
          [t.account_name]
        );

        // Get card ID
        const card = await db.get(
          'SELECT id FROM credit_cards WHERE name = ?',
          [t.card_name]
        );

        const result = await db.run(
          `INSERT INTO transactions 
           (date, amount, currency, description, category_id, account_id, card_id,
            is_recurring, is_unplanned, is_entitlement, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.date, t.amount, t.currency, t.description, category?.id, account?.id, card?.id,
           t.is_recurring, t.is_unplanned, t.is_entitlement, t.notes]
        );

        results.push({ success: true, id: result.lastID });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    res.json({
      total: transactions.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import transactions' });
  }
});

module.exports = router; 