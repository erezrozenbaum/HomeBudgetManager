const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.env.APPDATA || process.env.HOME, 'MyBudgetManager', 'database.sqlite');
  }

  async initialize() {
    // Create app data directory if it doesn't exist
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize database
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
    });

    // Enable foreign keys
    await this.run('PRAGMA foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await this.exec(schema);

    // Initialize default settings
    await this.initializeDefaultSettings();

    console.log('Database initialized successfully');
  }

  async initializeDefaultSettings() {
    const defaultSettings = [
      { key: 'language', value: 'en' },
      { key: 'timezone', value: 'UTC' },
      { key: 'currency', value: 'USD' },
      { key: 'theme', value: 'system' }
    ];

    for (const setting of defaultSettings) {
      await this.run(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [setting.key, setting.value]
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

  // Audit logging
  async logAction(action, entityType, entityId, details = null) {
    await this.run(
      'INSERT INTO audit_log (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)',
      [action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  }
}

module.exports = new Database(); 