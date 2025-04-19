const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { logger } = require('../middleware/errorHandler');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const MONGODB_URI = process.env.MONGODB_URI;
const RETENTION_DAYS = 7;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

  return new Promise((resolve, reject) => {
    const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error('Backup failed:', { error, stderr });
        reject(error);
        return;
      }

      logger.info('Backup completed successfully', { stdout });
      resolve(backupPath);
    });
  });
};

const cleanupOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = new Date();

  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);

    if (ageInDays > RETENTION_DAYS) {
      fs.rmSync(filePath, { recursive: true, force: true });
      logger.info('Deleted old backup', { file, ageInDays });
    }
  });
};

const restoreDatabase = (backupPath) => {
  return new Promise((resolve, reject) => {
    const command = `mongorestore --uri="${MONGODB_URI}" --drop "${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error('Restore failed:', { error, stderr });
        reject(error);
        return;
      }

      logger.info('Restore completed successfully', { stdout });
      resolve();
    });
  });
};

const listBackups = () => {
  return fs.readdirSync(BACKUP_DIR)
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.mtime
      };
    })
    .sort((a, b) => b.created - a.created);
};

module.exports = {
  backupDatabase,
  cleanupOldBackups,
  restoreDatabase,
  listBackups
}; 