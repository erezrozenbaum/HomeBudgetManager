const { ipcMain } = require('electron');
const { createBackup, restoreBackup, listBackups, deleteBackup } = require('../../scripts/backup');
const fs = require('fs');
const path = require('path');

// Register IPC handlers
function registerBackupHandlers() {
  // List backups
  ipcMain.handle('list-backups', async () => {
    try {
      const backups = listBackups();
      // Add file size to each backup
      return backups.map(backup => ({
        ...backup,
        size: fs.statSync(backup.path).size
      }));
    } catch (error) {
      throw new Error('Failed to list backups: ' + error.message);
    }
  });

  // Create backup
  ipcMain.handle('create-backup', async (event) => {
    try {
      // Create a progress emitter
      const progressEmitter = (progress) => {
        event.sender.send('backup-progress', progress);
      };

      // Create the backup
      const backupPath = await createBackup(progressEmitter);
      return { success: true, path: backupPath };
    } catch (error) {
      throw new Error('Failed to create backup: ' + error.message);
    }
  });

  // Restore backup
  ipcMain.handle('restore-backup', async (event, backupPath) => {
    try {
      await restoreBackup(backupPath);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to restore backup: ' + error.message);
    }
  });

  // Delete backup
  ipcMain.handle('delete-backup', async (event, backupPath) => {
    try {
      fs.unlinkSync(backupPath);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete backup: ' + error.message);
    }
  });
}

module.exports = {
  registerBackupHandlers
}; 