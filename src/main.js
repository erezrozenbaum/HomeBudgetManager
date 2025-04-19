// Settings API endpoints
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  });
});

app.put('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ [key]: value });
  });
});

// Categories API endpoints
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name, type, color } = req.body;
  db.run(
    'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)',
    [name, type, color],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        name,
        type,
        color
      });
    }
  );
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categories WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Data Management API endpoints
app.post('/api/import', (req, res) => {
  if (!req.files || !req.files.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const file = req.files.file;
  const fileType = file.name.split('.').pop().toLowerCase();

  if (fileType === 'csv') {
    // Handle CSV import
    const csvData = file.data.toString();
    const rows = csvData.split('\n').map(row => row.split(','));
    const headers = rows[0];
    
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      try {
        // Clear existing data
        db.run('DELETE FROM transactions');
        db.run('DELETE FROM accounts');
        db.run('DELETE FROM categories');
        
        // Import new data
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === headers.length) {
            const data = headers.reduce((obj, header, index) => {
              obj[header] = row[index];
              return obj;
            }, {});
            
            // Insert data based on the file type
            if (data.type === 'transaction') {
              db.run(
                'INSERT INTO transactions (date, amount, description, category, account_id) VALUES (?, ?, ?, ?, ?)',
                [data.date, data.amount, data.description, data.category, data.account_id]
              );
            } else if (data.type === 'account') {
              db.run(
                'INSERT INTO accounts (name, type, balance, currency) VALUES (?, ?, ?, ?)',
                [data.name, data.type, data.balance, data.currency]
              );
            } else if (data.type === 'category') {
              db.run(
                'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)',
                [data.name, data.type, data.color]
              );
            }
          }
        }
        
        db.run('COMMIT');
        res.json({ success: true });
      } catch (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
      }
    });
  } else if (fileType === 'json') {
    // Handle JSON import
    const jsonData = JSON.parse(file.data.toString());
    
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      try {
        // Clear existing data
        db.run('DELETE FROM transactions');
        db.run('DELETE FROM accounts');
        db.run('DELETE FROM categories');
        
        // Import new data
        if (jsonData.transactions) {
          jsonData.transactions.forEach(transaction => {
            db.run(
              'INSERT INTO transactions (date, amount, description, category, account_id) VALUES (?, ?, ?, ?, ?)',
              [transaction.date, transaction.amount, transaction.description, transaction.category, transaction.account_id]
            );
          });
        }
        
        if (jsonData.accounts) {
          jsonData.accounts.forEach(account => {
            db.run(
              'INSERT INTO accounts (name, type, balance, currency) VALUES (?, ?, ?, ?)',
              [account.name, account.type, account.balance, account.currency]
            );
          });
        }
        
        if (jsonData.categories) {
          jsonData.categories.forEach(category => {
            db.run(
              'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)',
              [category.name, category.type, category.color]
            );
          });
        }
        
        db.run('COMMIT');
        res.json({ success: true });
      } catch (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
      }
    });
  } else {
    res.status(400).json({ error: 'Unsupported file type' });
  }
});

app.get('/api/export', (req, res) => {
  const { format } = req.query;
  
  if (format === 'csv') {
    // Export as CSV
    db.all('SELECT * FROM transactions', [], (err, transactions) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const headers = ['date', 'amount', 'description', 'category', 'account_id'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => headers.map(h => t[h]).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csvContent);
    });
  } else if (format === 'json') {
    // Export as JSON
    db.all('SELECT * FROM transactions', [], (err, transactions) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.json');
      res.send(JSON.stringify(transactions, null, 2));
    });
  } else {
    res.status(400).json({ error: 'Unsupported export format' });
  }
});

app.delete('/api/data', (req, res) => {
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    try {
      // Delete all data from all tables
      db.run('DELETE FROM transactions');
      db.run('DELETE FROM accounts');
      db.run('DELETE FROM categories');
      db.run('DELETE FROM settings');
      
      db.run('COMMIT');
      res.json({ success: true });
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });
});

// Investments API endpoints
app.get('/api/investments', (req, res) => {
  db.all('SELECT * FROM investments', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/investments', (req, res) => {
  const {
    name,
    type,
    amount,
    currency,
    purchaseDate,
    currentValue,
    linkedGoalId,
    linkedBusinessId,
    notes
  } = req.body;

  db.run(
    `INSERT INTO investments (
      name, type, amount, currency, purchase_date, current_value,
      linked_goal_id, linked_business_id, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, type, amount, currency, purchaseDate, currentValue,
      linkedGoalId || null, linkedBusinessId || null, notes
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        name,
        type,
        amount,
        currency,
        purchaseDate,
        currentValue,
        linkedGoalId,
        linkedBusinessId,
        notes
      });
    }
  );
});

app.delete('/api/investments/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM investments WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Initialize database tables
db.serialize(() => {
  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Investments table
  db.run(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('stock', 'crypto', 'realEstate', 'other')),
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      current_value REAL NOT NULL,
      linked_goal_id INTEGER,
      linked_business_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (linked_goal_id) REFERENCES saving_goals(id),
      FOREIGN KEY (linked_business_id) REFERENCES businesses(id)
    )
  `);

  // Create trigger to update updated_at timestamp for investments
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_investment_timestamp
    AFTER UPDATE ON investments
    BEGIN
      UPDATE investments SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END
  `);

  // Insert default settings if they don't exist
  const defaultSettings = [
    ['language', 'en'],
    ['timezone', 'UTC'],
    ['defaultCurrency', 'USD'],
    ['theme', 'light']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([key, value]) => {
    stmt.run(key, value);
  });
  stmt.finalize();

  // Insert default categories if they don't exist
  const defaultCategories = [
    ['Food', 'expense', '#FF6B6B'],
    ['Transportation', 'expense', '#4ECDC4'],
    ['Housing', 'expense', '#45B7D1'],
    ['Utilities', 'expense', '#96CEB4'],
    ['Entertainment', 'expense', '#FFEEAD'],
    ['Healthcare', 'expense', '#D4A5A5'],
    ['Shopping', 'expense', '#9B59B6'],
    ['Salary', 'income', '#2ECC71'],
    ['Investment', 'income', '#3498DB'],
    ['Other Income', 'income', '#F1C40F']
  ];

  const categoryStmt = db.prepare(`
    INSERT OR IGNORE INTO categories (name, type, color)
    VALUES (?, ?, ?)
  `);
  defaultCategories.forEach(([name, type, color]) => {
    categoryStmt.run(name, type, color);
  });
  categoryStmt.finalize();

  // Create trigger to update updated_at timestamp for categories
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_category_timestamp
    AFTER UPDATE ON categories
    BEGIN
      UPDATE categories SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END
  `);
}); 