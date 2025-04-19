const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

// Configuration
const config = {
  backupDir: path.join(process.env.APPDATA, 'BudgetManager', 'backups'),
  dataDir: path.join(process.env.APPDATA, 'BudgetManager', 'data'),
  maxBackups: 5,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production'
};

// Ensure backup directory exists
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

// Generate backup filename with timestamp
function generateBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `backup-${timestamp}.zip`;
}

// Encrypt file with progress reporting
function encryptFile(inputPath, outputPath, progressCallback) {
  return new Promise((resolve, reject) => {
    const cipher = crypto.createCipher('aes-256-cbc', config.encryptionKey);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    let totalBytes = 0;
    let processedBytes = 0;

    // Get total file size
    fs.stat(inputPath, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      totalBytes = stats.size;

      input.on('data', (chunk) => {
        processedBytes += chunk.length;
        const progress = Math.round((processedBytes / totalBytes) * 100);
        if (progressCallback) {
          progressCallback(progress);
        }
      });

      input.pipe(cipher).pipe(output);

      output.on('finish', resolve);
      output.on('error', reject);
    });
  });
}

// Create backup with progress reporting
async function createBackup(progressCallback) {
  try {
    console.log('Starting backup process...');

    // Create temporary directory
    const tempDir = path.join(config.backupDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Copy data files to temporary directory
    const files = fs.readdirSync(config.dataDir);
    const totalFiles = files.length;
    let processedFiles = 0;

    for (const file of files) {
      if (file.endsWith('.json') || file.endsWith('.db')) {
        fs.copyFileSync(
          path.join(config.dataDir, file),
          path.join(tempDir, file)
        );
        processedFiles++;
        if (progressCallback) {
          progressCallback(Math.round((processedFiles / totalFiles) * 25));
        }
      }
    }

    // Create zip file
    const backupFilename = generateBackupFilename();
    const zipPath = path.join(config.backupDir, backupFilename);
    
    await new Promise((resolve, reject) => {
      exec(`powershell Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${zipPath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    if (progressCallback) {
      progressCallback(50);
    }

    // Encrypt the backup
    const encryptedPath = path.join(config.backupDir, `encrypted-${backupFilename}`);
    await encryptFile(zipPath, encryptedPath, (progress) => {
      if (progressCallback) {
        progressCallback(50 + Math.round(progress * 0.5));
      }
    });

    // Clean up
    fs.unlinkSync(zipPath);
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Remove old backups if exceeding maxBackups
    const backups = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('encrypted-backup-'))
      .sort()
      .reverse();

    if (backups.length > config.maxBackups) {
      for (let i = config.maxBackups; i < backups.length; i++) {
        fs.unlinkSync(path.join(config.backupDir, backups[i]));
      }
    }

    if (progressCallback) {
      progressCallback(100);
    }

    console.log('Backup completed successfully!');
    return encryptedPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Restore backup
async function restoreBackup(backupPath) {
  try {
    console.log('Starting restore process...');

    // Decrypt the backup
    const tempDir = path.join(config.backupDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const decryptedPath = path.join(tempDir, 'decrypted.zip');
    const decipher = crypto.createDecipher('aes-256-cbc', config.encryptionKey);
    const input = fs.createReadStream(backupPath);
    const output = fs.createWriteStream(decryptedPath);

    await new Promise((resolve, reject) => {
      input.pipe(decipher).pipe(output);
      output.on('finish', resolve);
      output.on('error', reject);
    });

    // Extract zip file
    await new Promise((resolve, reject) => {
      exec(`powershell Expand-Archive -Path "${decryptedPath}" -DestinationPath "${tempDir}" -Force`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Copy files to data directory
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      if (file.endsWith('.json') || file.endsWith('.db')) {
        fs.copyFileSync(
          path.join(tempDir, file),
          path.join(config.dataDir, file)
        );
      }
    }

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('Restore completed successfully!');
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}

// List available backups
function listBackups() {
  const backups = fs.readdirSync(config.backupDir)
    .filter(file => file.startsWith('encrypted-backup-'))
    .sort()
    .reverse();

  return backups.map(file => ({
    filename: file,
    path: path.join(config.backupDir, file),
    date: new Date(file.split('-')[2].replace(/_/g, ':'))
  }));
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups
}; 