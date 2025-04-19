const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class Database {
  constructor() {
    this.appDataPath = app.getPath('userData');
    this.dbPath = path.join(this.appDataPath, 'budgetmanager.db');
    this.db = null;
  }

  async initialize() {
    // Create app data directory if it doesn't exist
    if (!fs.existsSync(this.appDataPath)) {
      fs.mkdirSync(this.appDataPath, { recursive: true });
    }

    // Open database connection
    this.db = new sqlite3.Database(this.dbPath);

    // Enable foreign keys
    await this.run('PRAGMA foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await this.exec(schema);

    // Initialize default settings
    await this.initializeDefaultSettings();

    // Initialize default categories
    await this.initializeDefaultCategories();

    return this;
  }

  async initializeDefaultSettings() {
    const defaultSettings = [
      { key: 'language', value: 'en' },
      { key: 'timezone', value: 'UTC' },
      { key: 'currency', value: 'USD' },
      { key: 'theme', value: 'light' },
      { key: 'date_format', value: 'YYYY-MM-DD' },
      { key: 'number_format', value: 'en-US' },
      { key: 'decimal_places', value: '2' },
      { key: 'thousand_separator', value: ',' },
      { key: 'decimal_separator', value: '.' }
    ];

    for (const setting of defaultSettings) {
      await this.run(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [setting.key, setting.value]
      );
    }
  }

  async initializeDefaultCategories() {
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
      { name: 'Business', type: 'income', color: '#3B82F6', icon: '🏢' },
      { name: 'Investments', type: 'income', color: '#8B5CF6', icon: '📈' },
      { name: 'Other Income', type: 'income', color: '#6366F1', icon: '💸' },

      // Expense categories
      { name: 'Housing', type: 'expense', color: '#F59E0B', icon: '🏠' },
      { name: 'Transportation', type: 'expense', color: '#EF4444', icon: '🚗' },
      { name: 'Food', type: 'expense', color: '#EC4899', icon: '🍽️' },
      { name: 'Utilities', type: 'expense', color: '#14B8A6', icon: '💡' },
      { name: 'Insurance', type: 'expense', color: '#8B5CF6', icon: '🛡️' },
      { name: 'Healthcare', type: 'expense', color: '#F43F5E', icon: '🏥' },
      { name: 'Entertainment', type: 'expense', color: '#F97316', icon: '🎮' },
      { name: 'Shopping', type: 'expense', color: '#8B5CF6', icon: '🛍️' },
      { name: 'Education', type: 'expense', color: '#06B6D4', icon: '📚' },
      { name: 'Other Expenses', type: 'expense', color: '#64748B', icon: '💳' }
    ];

    for (const category of defaultCategories) {
      await this.run(
        'INSERT OR IGNORE INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
        [category.name, category.type, category.color, category.icon]
      );
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database; 