const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/budget.db');

// Create indexes for frequently queried columns
const createIndexes = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Transactions table indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date 
        ON transactions(date);
      `);
      
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_transactions_category 
        ON transactions(category_id);
      `);
      
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_transactions_account 
        ON transactions(account_id);
      `);
      
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_transactions_type 
        ON transactions(type);
      `);

      // Bank accounts indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency 
        ON bank_accounts(currency);
      `);

      // Credit cards indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_credit_cards_bank_id 
        ON credit_cards(bank_id);
      `);

      // Investments indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_investments_type 
        ON investments(type);
      `);

      // Saving goals indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_saving_goals_status 
        ON saving_goals(status);
      `);

      // Loans indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_loans_status 
        ON loans(status);
      `);

      // Materialized views for complex queries
      db.run(`
        CREATE VIEW IF NOT EXISTS monthly_summary AS
        SELECT 
          strftime('%Y-%m', date) as month,
          type,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM transactions
        GROUP BY strftime('%Y-%m', date), type;
      `);

      db.run(`
        CREATE VIEW IF NOT EXISTS category_summary AS
        SELECT 
          c.name as category_name,
          t.type,
          SUM(t.amount) as total_amount,
          COUNT(*) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        GROUP BY c.name, t.type;
      `);

      // Set SQLite performance settings
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = NORMAL;');
      db.run('PRAGMA cache_size = -2000;'); // 2MB cache
      db.run('PRAGMA temp_store = MEMORY;');
      db.run('PRAGMA mmap_size = 30000000000;'); // 30GB memory map
      
      resolve();
    });
  });
};

// Initialize database optimizations
const initializeOptimizations = async () => {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database file not found');
    return;
  }

  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
  });

  try {
    await createIndexes(db);
    console.log('Database optimizations completed successfully');
  } catch (err) {
    console.error('Error during database optimization:', err);
  } finally {
    db.close();
  }
};

module.exports = {
  initializeOptimizations
}; 