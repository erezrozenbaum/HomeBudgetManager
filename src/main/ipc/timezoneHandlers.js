const { ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();

// Register timezone handlers
function registerTimezoneHandlers() {
  // Get timezone preferences
  ipcMain.handle('get-timezone-preferences', () => {
    return {
      timezone: store.get('timezone', 'UTC'),
      timeFormat: store.get('timeFormat', '24h'),
      dateFormat: store.get('dateFormat', 'MM/dd/yyyy')
    };
  });

  // Set timezone
  ipcMain.handle('set-timezone', (event, timezone) => {
    store.set('timezone', timezone);
    return { success: true };
  });

  // Set time format
  ipcMain.handle('set-time-format', (event, format) => {
    store.set('timeFormat', format);
    return { success: true };
  });

  // Set date format
  ipcMain.handle('set-date-format', (event, format) => {
    store.set('dateFormat', format);
    return { success: true };
  });

  // Get available timezones
  ipcMain.handle('get-available-timezones', () => {
    const { getAllTimezones } = require('countries-and-timezones');
    return getAllTimezones();
  });
}

module.exports = {
  registerTimezoneHandlers
}; 