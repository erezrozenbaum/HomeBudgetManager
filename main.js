const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
const localApi = express();
const db = new Database('./budget.db');

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
      enableRemoteModule: true
    }
  });

  // Load the index.html file
  if (isDev) {
    mainWindow.loadFile('dist/index.html');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
const PORT = 3001;
localApi.listen(PORT, () => {
  console.log(`Local API server running on port ${PORT}`);
});

// Handle IPC messages
ipcMain.handle('auth:get-current-user', async () => {
  // TODO: Implement user authentication
  return null;
});

ipcMain.handle('auth:login', async (event, credentials) => {
  // TODO: Implement login
  return null;
});

ipcMain.handle('auth:logout', async () => {
  // TODO: Implement logout
  return true;
}); 