const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.dbPath = path.join(__dirname, '../../data/budget.db');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(password = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      const backup = new sqlite3.Database(backupPath);

      db.backup(backup, {
        step: (totalPages, remainingPages) => {
          console.log(`Backup progress: ${((totalPages - remainingPages) / totalPages * 100).toFixed(2)}%`);
        },
        finish: () => {
          db.close();
          backup.close();

          if (password) {
            this.encryptBackup(backupPath, password)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(backupPath);
          }
        }
      });
    });
  }

  async encryptBackup(backupPath, password) {
    return new Promise((resolve, reject) => {
      const encryptedPath = `${backupPath}.enc`;
      const key = crypto.scryptSync(password, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      
      const input = fs.createReadStream(backupPath);
      const output = fs.createWriteStream(encryptedPath);
      
      input.pipe(cipher).pipe(output);
      
      output.on('finish', () => {
        fs.unlinkSync(backupPath);
        resolve(encryptedPath);
      });
      
      output.on('error', reject);
    });
  }

  async restoreBackup(backupPath, password = null) {
    return new Promise((resolve, reject) => {
      if (password) {
        this.decryptBackup(backupPath, password)
          .then(decryptedPath => this.performRestore(decryptedPath))
          .then(resolve)
          .catch(reject);
      } else {
        this.performRestore(backupPath)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  async decryptBackup(backupPath, password) {
    return new Promise((resolve, reject) => {
      const decryptedPath = backupPath.replace('.enc', '');
      const key = crypto.scryptSync(password, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      
      const input = fs.createReadStream(backupPath);
      const output = fs.createWriteStream(decryptedPath);
      
      input.pipe(decipher).pipe(output);
      
      output.on('finish', () => {
        resolve(decryptedPath);
      });
      
      output.on('error', reject);
    });
  }

  async performRestore(backupPath) {
    return new Promise((resolve, reject) => {
      const backup = new sqlite3.Database(backupPath);
      const db = new sqlite3.Database(this.dbPath);

      backup.backup(db, {
        step: (totalPages, remainingPages) => {
          console.log(`Restore progress: ${((totalPages - remainingPages) / totalPages * 100).toFixed(2)}%`);
        },
        finish: () => {
          backup.close();
          db.close();
          resolve();
        }
      });
    });
  }

  listBackups() {
    return fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        date: new Date(file.split('-')[1].replace('.db', '').replace('.enc', ''))
      }))
      .sort((a, b) => b.date - a.date);
  }

  deleteBackup(backupPath) {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      return true;
    }
    return false;
  }
}

module.exports = new BackupManager(); 