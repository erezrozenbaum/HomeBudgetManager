const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

// Generate a secure encryption key for sensitive data
function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

// Create database directory if it doesn't exist
function createDatabaseDirectory() {
    const dbDir = getAppDataPath();
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    return dbDir;
}

// Initialize database schema
function initializeDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(new Error(`Failed to create database: ${err.message}`));
                return;
            }

            console.log('Creating database schema...');
            
            db.serialize(() => {
                // Enable foreign keys and WAL mode for better performance
                db.run('PRAGMA foreign_keys = ON');
                db.run('PRAGMA journal_mode = WAL');
                db.run('PRAGMA synchronous = NORMAL');

                // Users table with enhanced security and profile features
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    phone_number TEXT,
                    profile_picture TEXT,
                    two_factor_enabled BOOLEAN DEFAULT 0,
                    two_factor_secret TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    last_password_change DATETIME,
                    password_reset_token TEXT,
                    password_reset_expires DATETIME,
                    account_status TEXT DEFAULT 'active',
                    is_admin BOOLEAN DEFAULT 0,
                    settings TEXT,
                    notification_preferences TEXT
                )`);

                // Categories table with hierarchical support
                db.run(`CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    parent_id INTEGER,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    color TEXT,
                    icon TEXT,
                    description TEXT,
                    budget_limit REAL,
                    is_system BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (parent_id) REFERENCES categories(id)
                )`);

                // Accounts table with enhanced features
                db.run(`CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    currency TEXT NOT NULL,
                    initial_balance REAL NOT NULL,
                    current_balance REAL NOT NULL,
                    credit_limit REAL,
                    interest_rate REAL,
                    account_number TEXT ENCRYPTED,
                    bank_name TEXT,
                    bank_branch TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    is_hidden BOOLEAN DEFAULT 0,
                    notes TEXT,
                    icon TEXT,
                    color TEXT,
                    last_sync DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // Transactions table with attachments and recurring support
                db.run(`CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    account_id INTEGER,
                    category_id INTEGER,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    exchange_rate REAL DEFAULT 1,
                    description TEXT,
                    notes TEXT,
                    date DATETIME NOT NULL,
                    status TEXT DEFAULT 'completed',
                    is_recurring BOOLEAN DEFAULT 0,
                    recurring_id INTEGER,
                    location TEXT,
                    tags TEXT,
                    attachments TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (account_id) REFERENCES accounts(id),
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )`);

                // Recurring Transactions table
                db.run(`CREATE TABLE IF NOT EXISTS recurring_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    account_id INTEGER,
                    category_id INTEGER,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT,
                    frequency TEXT NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    last_generated DATETIME,
                    next_due DATETIME,
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (account_id) REFERENCES accounts(id),
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )`);

                // Budgets table with enhanced features
                db.run(`CREATE TABLE IF NOT EXISTS budgets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    category_id INTEGER,
                    name TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    period TEXT NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    rollover BOOLEAN DEFAULT 0,
                    notifications_enabled BOOLEAN DEFAULT 1,
                    alert_threshold INTEGER,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )`);

                // Investment Accounts table
                db.run(`CREATE TABLE IF NOT EXISTS investment_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    broker TEXT,
                    account_number TEXT ENCRYPTED,
                    currency TEXT NOT NULL,
                    current_value REAL NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // Stock Portfolio table with enhanced tracking
                db.run(`CREATE TABLE IF NOT EXISTS stock_portfolio (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    investment_account_id INTEGER,
                    symbol TEXT NOT NULL,
                    company_name TEXT,
                    shares REAL NOT NULL,
                    purchase_price REAL NOT NULL,
                    current_price REAL,
                    purchase_date DATE NOT NULL,
                    purchase_fees REAL,
                    notes TEXT,
                    alerts TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (investment_account_id) REFERENCES investment_accounts(id)
                )`);

                // Stock Transactions table
                db.run(`CREATE TABLE IF NOT EXISTS stock_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    portfolio_id INTEGER,
                    type TEXT NOT NULL,
                    shares REAL NOT NULL,
                    price REAL NOT NULL,
                    fees REAL,
                    date DATETIME NOT NULL,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (portfolio_id) REFERENCES stock_portfolio(id)
                )`);

                // Goals table
                db.run(`CREATE TABLE IF NOT EXISTS financial_goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    target_amount REAL NOT NULL,
                    current_amount REAL DEFAULT 0,
                    currency TEXT NOT NULL,
                    start_date DATE NOT NULL,
                    target_date DATE,
                    status TEXT DEFAULT 'active',
                    priority INTEGER,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // Reports table
                db.run(`CREATE TABLE IF NOT EXISTS saved_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    parameters TEXT,
                    schedule TEXT,
                    last_generated DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // Notifications table
                db.run(`CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    read BOOLEAN DEFAULT 0,
                    action_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // User Audit table with enhanced tracking
                db.run(`CREATE TABLE IF NOT EXISTS user_audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    entity_type TEXT,
                    entity_id INTEGER,
                    details TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    device_info TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);

                // Create optimized indexes
                db.run('CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date)');
                db.run('CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id)');
                db.run('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)');
                db.run('CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(recurring_id)');
                db.run('CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period)');
                db.run('CREATE INDEX IF NOT EXISTS idx_stock_portfolio_user ON stock_portfolio(user_id, symbol)');
                db.run('CREATE INDEX IF NOT EXISTS idx_stock_portfolio_account ON stock_portfolio(investment_account_id)');
                db.run('CREATE INDEX IF NOT EXISTS idx_user_audit_user ON user_audit(user_id, created_at)');
                db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read)');
                db.run('CREATE INDEX IF NOT EXISTS idx_goals_user ON financial_goals(user_id, status)');
                db.run('CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_transactions(next_due)');

                // Create default admin user
                const adminPassword = crypto.randomBytes(12).toString('hex');
                const passwordHash = bcrypt.hashSync(adminPassword, 10);
                
                db.run(`INSERT OR IGNORE INTO users (
                    username, 
                    password_hash, 
                    email, 
                    is_admin, 
                    account_status
                ) VALUES (?, ?, ?, 1, 'active')`, 
                ['admin', passwordHash, 'admin@homebudgetmanager.com']);

                // Store admin credentials securely
                const credentialsPath = path.join(getAppDataPath(), 'admin_credentials.txt');
                fs.writeFileSync(credentialsPath, 
                    `Initial Admin Credentials:\nUsername: admin\nPassword: ${adminPassword}\n`, 
                    { mode: 0o600 });
            });

            db.close((err) => {
                if (err) {
                    reject(new Error(`Failed to close database: ${err.message}`));
                    return;
                }
                resolve();
            });
        });
    });
}

// Store encryption key securely
function storeEncryptionKey(dbDir, key) {
    const keyPath = path.join(dbDir, '.env');
    fs.writeFileSync(keyPath, `DB_ENCRYPTION_KEY=${key}\n`, { mode: 0o600 });
}

async function main() {
    try {
        console.log('Initializing database...');
        
        // Create database directory
        const dbDir = createDatabaseDirectory();
        console.log(`Database directory: ${dbDir}`);
        
        // Generate and store encryption key
        const encryptionKey = generateEncryptionKey();
        storeEncryptionKey(dbDir, encryptionKey);
        console.log('Encryption key generated and stored');
        
        // Initialize database
        const dbPath = path.join(dbDir, 'budget.db');
        await initializeDatabase(dbPath);
        
        console.log('Database initialization completed successfully!');
        console.log('Admin credentials have been stored in admin_credentials.txt');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run initialization
main(); 