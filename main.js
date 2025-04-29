const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
const localApi = express();

// Get the appropriate app data directory based on platform
function getAppDataPath() {
    switch (process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA, 'HomeBudgetManager');
        case 'darwin':
            return path.join(process.env.HOME, 'Library', 'Application Support', 'HomeBudgetManager');
        case 'linux':
            return path.join(process.env.HOME, '.homeBudgetManager');
        default:
            throw new Error('Unsupported platform');
    }
}

// Create database directory if it doesn't exist
function createDatabaseDirectory() {
    const dbDir = getAppDataPath();
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    return dbDir;
}

// Initialize database connection
function initializeDatabaseConnection() {
    const dbDir = createDatabaseDirectory();
    const dbPath = path.join(dbDir, 'budget.db');
    return new Database(dbPath);
}

const db = initializeDatabaseConnection();

// Initialize database tables
function initializeDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Bank Accounts
  db.exec(`CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    branch TEXT,
    currency TEXT NOT NULL,
    color TEXT,
    initial_balance REAL NOT NULL,
    current_balance REAL NOT NULL
  )`);

  // Credit Cards
  db.exec(`CREATE TABLE IF NOT EXISTS credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    issuer TEXT,
    "limit" REAL,
    last_four_digits TEXT,
    billing_day INTEGER,
    bank_account_id INTEGER,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);

  // Transactions
  db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    is_recurring INTEGER,
    is_unplanned INTEGER,
    is_entitlement INTEGER,
    account_id INTEGER,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id)
  )`);

  // Investments
  db.exec(`CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    purchase_date TEXT,
    current_value REAL,
    linked_goal_id INTEGER,
    linked_business_id INTEGER,
    notes TEXT,
    FOREIGN KEY (linked_goal_id) REFERENCES saving_goals(id),
    FOREIGN KEY (linked_business_id) REFERENCES businesses(id)
  )`);

  // Saving Goals
  db.exec(`CREATE TABLE IF NOT EXISTS saving_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    target_date TEXT,
    status TEXT NOT NULL,
    notes TEXT
  )`);

  // Loans
  db.exec(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    interest_rate REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL,
    notes TEXT
  )`);

  // Insurances
  db.exec(`CREATE TABLE IF NOT EXISTS insurances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    premium_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    payment_frequency TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    category TEXT,
    notes TEXT
  )`);

  // Businesses
  db.exec(`CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    users TEXT,
    financials TEXT,
    profile TEXT,
    notes TEXT
  )`);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: true,
            allowRunningInsecureContent: false
        }
    });

    // Set CSP header
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' http://localhost:* ws://localhost:*; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data:; " +
                    "connect-src 'self' http://localhost:* ws://localhost:* data: blob:; " +
                    "font-src 'self' data:;"
                ]
            }
        });
    });

    // Add error handling
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
        console.error('Error details:', {
            errorCode,
            errorDescription,
            currentURL: mainWindow.webContents.getURL(),
            isDevToolsOpened: mainWindow.webContents.isDevToolsOpened()
        });
        
        // Attempt to reload on failure
        setTimeout(() => {
            console.log('Attempting to reload...');
            mainWindow.loadFile(getIndexPath()).catch(err => {
                console.error('Reload failed:', err);
                console.error('Error stack:', err.stack);
            });
        }, 1000);
    });

    // Get the correct path for index.html
    const indexPath = getIndexPath();
        
    console.log('Application paths:', {
        __dirname,
        indexPath,
        preloadPath: path.join(__dirname, 'preload.js'),
        appPath: app.getAppPath(),
        exePath: app.getPath('exe'),
        userData: app.getPath('userData')
    });
    
    console.log('File exists:', {
        html: fs.existsSync(indexPath),
        preload: fs.existsSync(path.join(__dirname, 'preload.js'))
    });
    
    try {
        const dirPath = path.dirname(indexPath);
        console.log('Directory contents:', fs.readdirSync(dirPath));
        console.log('App root contents:', fs.readdirSync(__dirname));
    } catch (err) {
        console.error('Failed to read directory:', err);
        console.error('Error stack:', err.stack);
    }

    mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load file:', err);
        console.error('Error stack:', err.stack);
        
        // Try to show error in window
        mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,
            <html>
                <body>
                    <h2>Error Loading Application</h2>
                    <pre>${err.toString()}</pre>
                    <h3>Paths:</h3>
                    <pre>${JSON.stringify({
                        __dirname,
                        indexPath,
                        exists: fs.existsSync(indexPath)
                    }, null, 2)}</pre>
                </body>
            </html>
        `);
    });

    // Only open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Helper function to get the correct index.html path
function getIndexPath() {
    if (isDev) {
        return path.join(__dirname, 'src', 'renderer', 'index.html');
    }
    
    // In production, check multiple possible locations
    const possiblePaths = [
        path.join(__dirname, 'renderer', 'index.html'),
        path.join(__dirname, 'dist', 'renderer', 'index.html'),
        path.join(app.getAppPath(), 'renderer', 'index.html')
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    // If no path is found, default to the standard production path
    return path.join(__dirname, 'renderer', 'index.html');
}

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Local API setup
localApi.use(express.json());

// Auth endpoints
localApi.get('/api/auth/status', (req, res) => {
  try {
    // For now, return default auth status
    res.json({
      isAuthenticated: true,
      user: null,
      isPasswordProtected: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example API endpoint
localApi.get('/api/accounts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM bank_accounts').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start local API server
const PORT = 3000;
localApi.listen(PORT, () => {
  console.log(`Local API server running on port ${PORT}`);
});

// Handle IPC messages
ipcMain.handle('auth:checkStatus', async () => {
  try {
    // For now, return default values
    return {
      isAuthenticated: true,
      isPasswordProtected: false,
      isEncryptionEnabled: false
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    throw error;
  }
});

ipcMain.handle('auth:setPassword', async (event, password) => {
  try {
    // TODO: Implement password setting
    return true;
  } catch (error) {
    console.error('Error setting password:', error);
    throw error;
  }
});

ipcMain.handle('auth:verifyPassword', async (event, password) => {
  try {
    // TODO: Implement password verification
    return true;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
});

ipcMain.handle('auth:setEncryption', async (event, key) => {
  try {
    // TODO: Implement encryption setting
    return true;
  } catch (error) {
    console.error('Error setting encryption:', error);
    throw error;
  }
});

ipcMain.handle('auth:disableEncryption', async () => {
  try {
    // TODO: Implement encryption disabling
    return true;
  } catch (error) {
    console.error('Error disabling encryption:', error);
    throw error;
  }
});

ipcMain.handle('auth:removePassword', async (event, currentPassword) => {
  try {
    // TODO: Implement password removal
    return true;
  } catch (error) {
    console.error('Error removing password:', error);
    throw error;
  }
});

// Add theme handlers
ipcMain.handle('get-system-theme', async () => {
  try {
    // For now, return default theme
    return 'light';
  } catch (error) {
    console.error('Error getting theme:', error);
    throw error;
  }
});

ipcMain.handle('set-theme', async (event, theme) => {
  try {
    // TODO: Implement theme setting
    return true;
  } catch (error) {
    console.error('Error setting theme:', error);
    throw error;
  }
});

// Add timezone handlers
ipcMain.handle('get-timezone-preferences', async () => {
  try {
    // For now, return default timezone
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      format24Hour: true
    };
  } catch (error) {
    console.error('Error getting timezone preferences:', error);
    throw error;
  }
});

ipcMain.handle('set-timezone-preferences', async (event, preferences) => {
  try {
    // TODO: Implement timezone preferences setting
    return true;
  } catch (error) {
    console.error('Error setting timezone preferences:', error);
    throw error;
  }
}); 