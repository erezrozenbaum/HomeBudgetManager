const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { securityMiddleware, encryptResponse, decryptRequest } = require('../middleware/security');
const { sessionMiddleware } = require('../middleware/session');
const Database = require('../database/init');
const auth = require('./middleware/auth');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const router = express.Router();

// Initialize database
let db;
(async () => {
  try {
    db = await new Database().initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware
router.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
router.use(bodyParser.json());
router.use(sessionMiddleware);
router.use(securityMiddleware);
router.use(encryptResponse);
router.use(decryptRequest);
router.use(helmet());
router.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
router.use(limiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import route modules
const bankAccountsRouter = require('./routes/bankAccounts');
const creditCardsRouter = require('./routes/creditCards');
const transactionsRouter = require('./routes/transactions');
const investmentsRouter = require('./routes/investments');
const savingGoalsRouter = require('./routes/savingGoals');
const loansRouter = require('./routes/loans');
const insurancesRouter = require('./routes/insurances');
const businessesRouter = require('./routes/businesses');
const categoriesRouter = require('./routes/categories');
const settingsRouter = require('./routes/settings');
const authRouter = require('./routes/auth');
const userRoutes = require('./routes/users');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goals');
const debtRoutes = require('./routes/debts');
const reportRoutes = require('./routes/reports');
const supportRoutes = require('./routes/support');
const backupRoutes = require('./routes/backup');

// Mount routes
router.use('/bank-accounts', bankAccountsRouter);
router.use('/credit-cards', creditCardsRouter);
router.use('/transactions', transactionsRouter);
router.use('/investments', investmentsRouter);
router.use('/saving-goals', savingGoalsRouter);
router.use('/loans', loansRouter);
router.use('/insurances', insurancesRouter);
router.use('/businesses', businessesRouter);
router.use('/categories', categoriesRouter);
router.use('/settings', settingsRouter);
router.use('/auth', authRouter);
router.use('/users', auth.authenticate, userRoutes);
router.use('/budgets', auth.authenticate, budgetRoutes);
router.use('/goals', auth.authenticate, goalRoutes);
router.use('/debts', auth.authenticate, debtRoutes);
router.use('/reports', auth.authenticate, reportRoutes);
router.use('/support', auth.authenticate, supportRoutes);
router.use('/backup', auth.authenticate, backupRoutes);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router; 