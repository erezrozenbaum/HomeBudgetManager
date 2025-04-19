const express = require('express');
const session = require('express-session');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const sessionMiddleware = require('./middleware/session');
const securityMiddleware = require('./middleware/security');
const authRoutes = require('./routes/auth');
const { registerBackupHandlers } = require('./ipc/backupHandlers');
const { registerThemeHandlers } = require('./ipc/themeHandlers');
const { registerTimezoneHandlers } = require('./ipc/timezoneHandlers');

const appDataPath = app.getPath('userData');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Security middleware
app.use(securityMiddleware.securityMiddleware);
app.use(securityMiddleware.encryptResponse);
app.use(securityMiddleware.decryptRequest);

// Session middleware
app.use(sessionMiddleware);

// Routes
app.use('/api/auth', authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../renderer')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../renderer/index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

function createWindow() {
  // ... existing window creation code ...

  // Register IPC handlers
  registerBackupHandlers();
  registerThemeHandlers();
  registerTimezoneHandlers();

  // ... rest of the window creation code ...
}

module.exports = app; 