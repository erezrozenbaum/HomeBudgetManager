const { ipcMain, nativeTheme } = require('electron');
const Store = require('electron-store');

const store = new Store();

// Register theme handlers
function registerThemeHandlers() {
  // Get current theme
  ipcMain.handle('get-theme', () => {
    return store.get('theme', 'light');
  });

  // Set theme
  ipcMain.handle('set-theme', (event, theme) => {
    store.set('theme', theme);
    return { success: true };
  });

  // Get system theme
  ipcMain.handle('get-system-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  // Listen for system theme changes
  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    ipcMain.emit('system-theme-changed', theme);
  });
}

module.exports = {
  registerThemeHandlers
}; 