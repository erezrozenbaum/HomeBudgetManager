const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { Database } = require('../database');

class SecurityService {
  constructor() {
    this.appDataPath = app.getPath('userData');
    this.securityConfigPath = path.join(this.appDataPath, 'security.json');
    this.encryptionKey = null;
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.securityConfigPath)) {
        const config = JSON.parse(fs.readFileSync(this.securityConfigPath, 'utf8'));
        this.isPasswordProtected = config.isPasswordProtected || false;
        this.isEncryptionEnabled = config.isEncryptionEnabled || false;
        this.passwordHash = config.passwordHash || null;
      } else {
        this.isPasswordProtected = false;
        this.isEncryptionEnabled = false;
        this.passwordHash = null;
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading security config:', error);
      this.isPasswordProtected = false;
      this.isEncryptionEnabled = false;
      this.passwordHash = null;
    }
  }

  saveConfig() {
    try {
      const config = {
        isPasswordProtected: this.isPasswordProtected,
        isEncryptionEnabled: this.isEncryptionEnabled,
        passwordHash: this.passwordHash
      };
      fs.writeFileSync(this.securityConfigPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving security config:', error);
    }
  }

  setPassword(password) {
    try {
      this.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      this.isPasswordProtected = true;
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  }

  verifyPassword(password) {
    try {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      return hash === this.passwordHash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  setEncryptionKey(key) {
    try {
      this.encryptionKey = key;
      this.isEncryptionEnabled = true;
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Error setting encryption key:', error);
      return false;
    }
  }

  encryptData(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decryptData(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  logAction(action, details = {}) {
    try {
      const logEntry = {
        action,
        timestamp: new Date().toISOString(),
        ...details
      };

      const logPath = path.join(this.appDataPath, 'audit.log');
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  isPasswordProtected() {
    return this.isPasswordProtected;
  }

  isEncryptionEnabled() {
    return this.isEncryptionEnabled;
  }

  // Audit Logging
  async logActionDB(action, details) {
    const db = new Database();
    await db.initialize();

    try {
      await db.run(
        `INSERT INTO audit_log (action, details, timestamp)
         VALUES (?, ?, ?)`,
        [action, JSON.stringify(details), new Date().toISOString()]
      );
    } finally {
      await db.close();
    }
  }

  // Security Checks
  async checkSecurityStatus() {
    const passwordExists = await fs.promises.access(
      path.join(this.appDataPath, 'password.json')
    ).then(() => true).catch(() => false);

    const encryptionKeyExists = this.encryptionKey !== null;

    return {
      passwordProtected: passwordExists,
      encryptionEnabled: encryptionKeyExists,
      isAuthenticated: this.isPasswordProtected
    };
  }

  // Data Export/Import Security
  async exportData() {
    const db = new Database();
    await db.initialize();

    try {
      const data = await db.all('SELECT * FROM audit_log');
      return this.encryptData(data);
    } finally {
      await db.close();
    }
  }

  async importData(encryptedData) {
    const decryptedData = await this.decryptData(encryptedData);
    const db = new Database();
    await db.initialize();

    try {
      await db.run('DELETE FROM audit_log');
      for (const entry of decryptedData) {
        await db.run(
          `INSERT INTO audit_log (action, details, timestamp)
           VALUES (?, ?, ?)`,
          [entry.action, entry.details, entry.timestamp]
        );
      }
    } finally {
      await db.close();
    }
  }
}

module.exports = new SecurityService(); 