const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class MigrationManager {
  constructor(db) {
    this.db = db;
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.ensureMigrationsTable();
  }

  ensureMigrationsTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async run() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const migrationName = file.replace('.sql', '');
      
      // Check if migration has already been run
      const row = await this.getMigration(migrationName);
      if (row) continue;

      console.log(`Running migration: ${migrationName}`);
      
      try {
        const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
        await this.runMigration(sql);
        await this.recordMigration(migrationName);
        console.log(`Migration ${migrationName} completed successfully`);
      } catch (error) {
        console.error(`Error running migration ${migrationName}:`, error);
        throw error;
      }
    }
  }

  getMigration(name) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM migrations WHERE name = ?',
        [name],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  runMigration(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  recordMigration(name) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        [name],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  async rollback(steps = 1) {
    const migrations = await this.getLastMigrations(steps);
    
    for (const migration of migrations) {
      console.log(`Rolling back migration: ${migration.name}`);
      
      try {
        const rollbackFile = path.join(this.migrationsDir, `${migration.name}_rollback.sql`);
        if (fs.existsSync(rollbackFile)) {
          const sql = fs.readFileSync(rollbackFile, 'utf8');
          await this.runMigration(sql);
        }
        await this.removeMigration(migration.name);
        console.log(`Migration ${migration.name} rolled back successfully`);
      } catch (error) {
        console.error(`Error rolling back migration ${migration.name}:`, error);
        throw error;
      }
    }
  }

  getLastMigrations(steps) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM migrations ORDER BY executed_at DESC LIMIT ?',
        [steps],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  removeMigration(name) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM migrations WHERE name = ?',
        [name],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
}

module.exports = MigrationManager; 