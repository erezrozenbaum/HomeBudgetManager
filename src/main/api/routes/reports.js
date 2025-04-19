const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Database = require('../../database/init');
const { authenticate, authorize } = require('../middleware/auth');
const { APIError } = require('../middleware/error');
const { validateRequest } = require('../middleware/validation');
const { cache } = require('../middleware/cache');
const { exportToExcel } = require('../utils/excel');
const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Environment Configuration
const {
  AI_PROVIDER = 'local', // 'local' or 'cloud'
  LOCAL_MODEL_PATH = './models/financial-advisor',
  CLOUD_API_KEY = '',
  CACHE_TTL = 3600, // 1 hour in seconds
  RATE_LIMIT_WINDOW = 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS = 100,
  LOG_LEVEL = 'info',
  NODE_ENV = 'development'
} = process.env;

// Validate required environment variables
if (AI_PROVIDER === 'cloud' && !CLOUD_API_KEY) {
  throw new Error('CLOUD_API_KEY is required when using cloud AI provider');
}

// Initialize database connection with connection pooling
let db;
const poolSize = 10;
const connectionPool = [];

// Performance metrics collection
const metrics = {
  queryTimes: new Map(),
  cacheHits: 0,
  cacheMisses: 0,
  materializedViewHits: 0,
  materializedViewMisses: 0,
  startTime: Date.now()
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const route = req.route?.path || req.path;
    
    // Record query time
    if (!metrics.queryTimes.has(route)) {
      metrics.queryTimes.set(route, []);
    }
    metrics.queryTimes.get(route).push(duration);
    
    // Keep only last 100 measurements per route
    if (metrics.queryTimes.get(route).length > 100) {
      metrics.queryTimes.get(route).shift();
    }
  });
  
  next();
};

// Get performance metrics endpoint
router.get('/metrics', authenticate, authorize(['admin']), (req, res) => {
  const routeMetrics = {};
  for (const [route, times] of metrics.queryTimes) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    
    routeMetrics[route] = {
      average: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      count: times.length
    };
  }
  
  res.json({
    uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
    cache: {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      hitRate: ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) + '%'
    },
    materializedViews: {
      hits: metrics.materializedViewHits,
      misses: metrics.materializedViewMisses,
      hitRate: ((metrics.materializedViewHits / (metrics.materializedViewHits + metrics.materializedViewMisses)) * 100).toFixed(2) + '%'
    },
    routes: routeMetrics
  });
});

// Apply performance monitoring middleware
router.use(performanceMonitor);

(async () => {
  try {
    for (let i = 0; i < poolSize; i++) {
      const connection = await Database.getInstance();
      connectionPool.push(connection);
    }
    db = connectionPool[0]; // Default connection
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
    process.exit(1);
  }
})();

// Get a connection from the pool
const getConnection = () => {
  const connection = connectionPool[Math.floor(Math.random() * poolSize)];
  return connection;
};

// Enhanced caching strategies
const cacheStrategies = {
  // Time-based caching with different TTLs
  timeBased: {
    short: { ttl: 60, maxSize: 1000 }, // 1 minute
    medium: { ttl: 300, maxSize: 500 }, // 5 minutes
    long: { ttl: 3600, maxSize: 100 } // 1 hour
  },
  // Size-based caching
  sizeBased: {
    small: { maxSize: 1000, ttl: 300 },
    medium: { maxSize: 500, ttl: 600 },
    large: { maxSize: 100, ttl: 3600 }
  },
  // Priority-based caching
  priorityBased: {
    high: { ttl: 3600, maxSize: 1000, priority: 1 },
    medium: { ttl: 300, maxSize: 500, priority: 2 },
    low: { ttl: 60, maxSize: 100, priority: 3 }
  }
};

// Additional materialized views
const createAdditionalMaterializedViews = async () => {
  try {
    await db.exec(`
      -- Business performance summary
      CREATE TABLE IF NOT EXISTS mv_business_performance (
        business_id INTEGER,
        period TEXT,
        total_income DECIMAL(15,2),
        total_expenses DECIMAL(15,2),
        net_profit DECIMAL(15,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (business_id, period, currency)
      );

      -- Debt analysis summary
      CREATE TABLE IF NOT EXISTS mv_debt_analysis (
        loan_id INTEGER PRIMARY KEY,
        total_paid DECIMAL(15,2),
        remaining_amount DECIMAL(15,2),
        next_payment_date DATE,
        status TEXT,
        last_updated TIMESTAMP
      );

      -- Investment portfolio summary
      CREATE TABLE IF NOT EXISTS mv_investment_portfolio (
        type TEXT,
        currency TEXT,
        total_invested DECIMAL(15,2),
        current_value DECIMAL(15,2),
        return_percentage DECIMAL(10,2),
        last_updated TIMESTAMP,
        PRIMARY KEY (type, currency)
      );

      -- Spending patterns summary
      CREATE TABLE IF NOT EXISTS mv_spending_patterns (
        category_id INTEGER,
        day_of_week INTEGER,
        hour_of_day INTEGER,
        total_amount DECIMAL(15,2),
        transaction_count INTEGER,
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, day_of_week, hour_of_day, currency)
      );

      -- Tax analysis summary
      CREATE TABLE IF NOT EXISTS mv_tax_analysis (
        year INTEGER,
        category_id INTEGER,
        total_amount DECIMAL(15,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (year, category_id, currency)
      );
    `);
  } catch (error) {
    console.error('Failed to create additional materialized views:', error);
  }
};

// Refresh additional materialized views
const refreshAdditionalMaterializedViews = async () => {
  try {
    const now = new Date().toISOString();
    await db.exec(`
      BEGIN TRANSACTION;

      -- Refresh business performance
      INSERT OR REPLACE INTO mv_business_performance
      SELECT 
        b.id as business_id,
        strftime('%Y-%m', t.date) as period,
        SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) as total_expenses,
        SUM(t.amount) as net_profit,
        t.currency,
        ? as last_updated
      FROM transactions t
      JOIN businesses b ON t.business_id = b.id
      GROUP BY b.id, period, t.currency;

      -- Refresh debt analysis
      INSERT OR REPLACE INTO mv_debt_analysis
      SELECT 
        l.id as loan_id,
        SUM(p.amount) as total_paid,
        l.amount - SUM(p.amount) as remaining_amount,
        l.next_payment_date,
        l.status,
        ? as last_updated
      FROM loans l
      LEFT JOIN loan_payments p ON l.id = p.loan_id
      GROUP BY l.id;

      -- Refresh investment portfolio
      INSERT OR REPLACE INTO mv_investment_portfolio
      SELECT 
        type,
        currency,
        SUM(amount) as total_invested,
        SUM(current_value) as current_value,
        (SUM(current_value) - SUM(amount)) / SUM(amount) * 100 as return_percentage,
        ? as last_updated
      FROM investments
      GROUP BY type, currency;

      -- Refresh spending patterns
      INSERT OR REPLACE INTO mv_spending_patterns
      SELECT 
        category_id,
        CAST(strftime('%w', date) as INTEGER) as day_of_week,
        CAST(strftime('%H', date) as INTEGER) as hour_of_day,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        currency,
        ? as last_updated
      FROM transactions
      GROUP BY category_id, day_of_week, hour_of_day, currency;

      -- Refresh tax analysis
      INSERT OR REPLACE INTO mv_tax_analysis
      SELECT 
        CAST(strftime('%Y', date) as INTEGER) as year,
        category_id,
        SUM(amount) as total_amount,
        currency,
        ? as last_updated
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE c.is_tax_deductible = 1
      GROUP BY year, category_id, currency;

      COMMIT;
    `, [now, now, now, now, now]);
  } catch (error) {
    console.error('Failed to refresh additional materialized views:', error);
    await db.exec('ROLLBACK;');
  }
};

// Initialize materialized views
createAdditionalMaterializedViews();

// Schedule materialized view refresh
setInterval(refreshAdditionalMaterializedViews, 3600000); // Refresh every hour

// Materialized views for frequently accessed data
const createMaterializedViews = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS mv_monthly_summary (
        period TEXT PRIMARY KEY,
        income DECIMAL(15,2),
        expenses DECIMAL(15,2),
        net_cash_flow DECIMAL(15,2),
        currency TEXT,
        last_updated TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mv_category_summary (
        category_id INTEGER,
        period TEXT,
        total_amount DECIMAL(15,2),
        transaction_count INTEGER,
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, period, currency)
      );

      CREATE TABLE IF NOT EXISTS mv_investment_summary (
        investment_id INTEGER PRIMARY KEY,
        current_value DECIMAL(15,2),
        return_percentage DECIMAL(10,2),
        last_updated TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Failed to create materialized views:', error);
  }
};

// Refresh materialized views
const refreshMaterializedViews = async () => {
  try {
    const now = new Date().toISOString();
    await db.exec(`
      BEGIN TRANSACTION;

      -- Refresh monthly summary
      INSERT OR REPLACE INTO mv_monthly_summary
      SELECT 
        strftime('%Y-%m', date) as period,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
        SUM(amount) as net_cash_flow,
        currency,
        ? as last_updated
      FROM transactions
      GROUP BY period, currency;

      -- Refresh category summary
      INSERT OR REPLACE INTO mv_category_summary
      SELECT 
        category_id,
        strftime('%Y-%m', date) as period,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        currency,
        ? as last_updated
      FROM transactions
      GROUP BY category_id, period, currency;

      -- Refresh investment summary
      INSERT OR REPLACE INTO mv_investment_summary
      SELECT 
        id as investment_id,
        current_value,
        ((current_value - amount) / amount * 100) as return_percentage,
        ? as last_updated
      FROM investments;

      COMMIT;
    `, [now, now, now]);
  } catch (error) {
    console.error('Failed to refresh materialized views:', error);
    await db.exec('ROLLBACK;');
  }
};

// Schedule materialized view refresh
setInterval(refreshMaterializedViews, 3600000); // Refresh every hour

// Optimized query for financial summary
const getFinancialSummary = async (start_date, end_date, currency) => {
  const connection = getConnection();
  return await connection.all(`
    WITH RECURSIVE
    -- Get transactions for the period
    period_transactions AS (
      SELECT * FROM transactions
      WHERE date BETWEEN ? AND ?
      ${currency ? 'AND currency = ?' : ''}
    ),
    -- Calculate daily balances
    daily_balances AS (
      SELECT 
        date,
        SUM(amount) OVER (
          PARTITION BY currency 
          ORDER BY date 
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) as running_balance,
        currency
      FROM period_transactions
    ),
    -- Get category totals
    category_totals AS (
      SELECT 
        c.name as category,
        c.type,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        t.currency
      FROM period_transactions t
      JOIN categories c ON t.category_id = c.id
      GROUP BY c.id, t.currency
    )
    SELECT 
      -- Overall summary
      (SELECT SUM(amount) FROM period_transactions WHERE amount > 0) as total_income,
      (SELECT SUM(amount) FROM period_transactions WHERE amount < 0) as total_expenses,
      (SELECT SUM(amount) FROM period_transactions) as net_cash_flow,
      -- Daily balances
      (SELECT json_group_array(json_object(
        'date', date,
        'balance', running_balance,
        'currency', currency
      )) FROM daily_balances) as daily_balances,
      -- Category breakdown
      (SELECT json_group_array(json_object(
        'category', category,
        'type', type,
        'total_amount', total_amount,
        'transaction_count', transaction_count,
        'currency', currency
      )) FROM category_totals) as category_breakdown
    FROM period_transactions
    LIMIT 1;
  `, [start_date, end_date, ...(currency ? [currency] : [])]);
};

// Validation middleware for report parameters
const validateReportParams = [
  query('start_date').optional().isISO8601().toDate(),
  query('end_date').optional().isISO8601().toDate(),
  query('currency').optional().isString().isLength({ min: 3, max: 3 }),
  query('format').optional().isIn(['excel', 'pdf', 'csv']),
  validateRequest
];

// Authentication and authorization middleware
router.use(authenticate);
router.use(authorize(['user', 'admin']));

// Get financial summary with caching and materialized views
router.get('/summary', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency } = req.query;
    
    // Try to get from materialized view first
    const cachedSummary = await db.get(`
      SELECT * FROM mv_monthly_summary
      WHERE period BETWEEN ? AND ?
      ${currency ? 'AND currency = ?' : ''}
      ORDER BY period DESC
      LIMIT 1
    `, [start_date, end_date, ...(currency ? [currency] : [])]);

    if (cachedSummary) {
      metrics.materializedViewHits++;
      return res.json(cachedSummary);
    }

    metrics.materializedViewMisses++;
    // If not in materialized view, calculate
    const summary = await getFinancialSummary(start_date, end_date, currency);
    res.json(summary);
  } catch (error) {
    console.error('Error in financial summary:', error);
    throw new APIError(500, 'Failed to generate financial summary', error);
  }
});

// Optimized query for trends with window functions
router.get('/trends', validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const trends = await db.all(`
      WITH RECURSIVE
      -- Get base data
      base_data AS (
        SELECT 
          strftime('%Y-%m', date) as period,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
          SUM(amount) as net_cash_flow,
          currency
        FROM transactions
        WHERE date BETWEEN ? AND ?
        ${currency ? 'AND currency = ?' : ''}
        GROUP BY period, currency
      ),
      -- Calculate running totals
      running_totals AS (
        SELECT 
          *,
          SUM(income) OVER (
            PARTITION BY currency 
            ORDER BY period 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) as running_income,
          SUM(expenses) OVER (
            PARTITION BY currency 
            ORDER BY period 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) as running_expenses,
          SUM(net_cash_flow) OVER (
            PARTITION BY currency 
            ORDER BY period 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) as running_net
        FROM base_data
      )
      SELECT * FROM running_totals
      ORDER BY period ASC
      LIMIT ? OFFSET ?;
    `, [start_date, end_date, ...(currency ? [currency] : []), limit, offset]);

    const total = await db.get(`
      SELECT COUNT(DISTINCT strftime('%Y-%m', date)) as count
      FROM transactions
      WHERE date BETWEEN ? AND ?
      ${currency ? 'AND currency = ?' : ''}
    `, [start_date, end_date, ...(currency ? [currency] : [])]);

    res.json({
      data: trends,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error in trends:', error);
    throw new APIError(500, 'Failed to generate trends', error);
  }
});

// Additional materialized views for sub-categories
const createSubCategoryViews = async () => {
  try {
    await db.exec(`
      -- Sub-category summary
      CREATE TABLE IF NOT EXISTS mv_subcategory_summary (
        parent_category_id INTEGER,
        subcategory_id INTEGER,
        period TEXT,
        total_amount DECIMAL(15,2),
        transaction_count INTEGER,
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (parent_category_id, subcategory_id, period, currency)
      );

      -- Category hierarchy
      CREATE TABLE IF NOT EXISTS mv_category_hierarchy (
        parent_id INTEGER,
        child_id INTEGER,
        level INTEGER,
        path TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (parent_id, child_id)
      );
    `);
  } catch (error) {
    console.error('Failed to create sub-category views:', error);
  }
};

// Refresh sub-category views
const refreshSubCategoryViews = async () => {
  try {
    const now = new Date().toISOString();
    await db.exec(`
      BEGIN TRANSACTION;

      -- Refresh sub-category summary
      INSERT OR REPLACE INTO mv_subcategory_summary
      SELECT 
        c.parent_id as parent_category_id,
        t.category_id as subcategory_id,
        strftime('%Y-%m', t.date) as period,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        t.currency,
        ? as last_updated
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE c.parent_id IS NOT NULL
      GROUP BY c.parent_id, t.category_id, period, t.currency;

      -- Refresh category hierarchy
      WITH RECURSIVE category_tree AS (
        SELECT 
          id as parent_id,
          id as child_id,
          0 as level,
          CAST(id AS TEXT) as path
        FROM categories
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT 
          ct.parent_id,
          c.id as child_id,
          ct.level + 1,
          ct.path || ',' || c.id
        FROM categories c
        JOIN category_tree ct ON c.parent_id = ct.child_id
      )
      INSERT OR REPLACE INTO mv_category_hierarchy
      SELECT 
        parent_id,
        child_id,
        level,
        path,
        ? as last_updated
      FROM category_tree;

      COMMIT;
    `, [now, now]);
  } catch (error) {
    console.error('Failed to refresh sub-category views:', error);
    await db.exec('ROLLBACK;');
  }
};

// Initialize sub-category views
createSubCategoryViews();

// Schedule sub-category view refresh
setInterval(refreshSubCategoryViews, 3600000); // Refresh every hour

// Add sub-category endpoints
router.get('/categories/hierarchy', cache(cacheStrategies.timeBased.long), async (req, res) => {
  try {
    const hierarchy = await db.all(`
      SELECT 
        c1.id as parent_id,
        c1.name as parent_name,
        c2.id as child_id,
        c2.name as child_name,
        ch.level,
        ch.path
      FROM mv_category_hierarchy ch
      JOIN categories c1 ON ch.parent_id = c1.id
      JOIN categories c2 ON ch.child_id = c2.id
      ORDER BY ch.path;
    `);

    res.json(hierarchy);
  } catch (error) {
    console.error('Error in category hierarchy:', error);
    throw new APIError(500, 'Failed to generate category hierarchy', error);
  }
});

router.get('/categories/:id/subcategories', cache(cacheStrategies.timeBased.medium), async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, currency } = req.query;

    const subcategories = await db.all(`
      SELECT 
        c.id,
        c.name,
        c.type,
        c.color,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        t.currency
      FROM categories c
      JOIN transactions t ON c.id = t.category_id
      WHERE c.parent_id = ?
      ${start_date ? 'AND t.date >= ?' : ''}
      ${end_date ? 'AND t.date <= ?' : ''}
      ${currency ? 'AND t.currency = ?' : ''}
      GROUP BY c.id, t.currency
      ORDER BY total_amount DESC;
    `, [id, ...(start_date ? [start_date] : []), ...(end_date ? [end_date] : []), ...(currency ? [currency] : [])]);

    res.json(subcategories);
  } catch (error) {
    console.error('Error in subcategories:', error);
    throw new APIError(500, 'Failed to get subcategories', error);
  }
});

// Update existing categories endpoint to include sub-categories
router.get('/categories', validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, type, currency, include_subcategories = false } = req.query;
    
    if (type && !['income', 'expense'].includes(type)) {
      throw new APIError(400, 'Invalid category type');
    }
    
    const analysis = await db.all(`
      WITH RECURSIVE category_totals AS (
        SELECT 
          c.id,
          c.name,
          c.type,
          c.color,
          c.parent_id,
          SUM(t.amount) as total_amount,
          COUNT(t.id) as transaction_count,
          AVG(t.amount) as average_amount,
          t.currency
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.date BETWEEN ? AND ?
        ${type ? 'AND c.type = ?' : ''}
        ${currency ? 'AND t.currency = ?' : ''}
        GROUP BY c.id, t.currency
      ),
      subcategory_totals AS (
        SELECT 
          c.parent_id,
          SUM(ct.total_amount) as subcategory_total,
          COUNT(DISTINCT ct.id) as subcategory_count,
          ct.currency
        FROM category_totals ct
        JOIN categories c ON ct.id = c.id
        WHERE c.parent_id IS NOT NULL
        GROUP BY c.parent_id, ct.currency
      )
      SELECT 
        ct.*,
        st.subcategory_total,
        st.subcategory_count,
        CASE 
          WHEN ct.parent_id IS NULL THEN 'parent'
          ELSE 'child'
        END as category_level
      FROM category_totals ct
      LEFT JOIN subcategory_totals st ON ct.id = st.parent_id AND ct.currency = st.currency
      ${include_subcategories ? '' : 'WHERE ct.parent_id IS NULL'}
      ORDER BY ct.total_amount DESC;
    `, [start_date, end_date, ...(type ? [type] : []), ...(currency ? [currency] : [])]);

    res.json(analysis);
  } catch (error) {
    console.error('Error in categories:', error);
    throw new APIError(500, 'Failed to generate category analysis', error);
  }
});

// Add missing features
router.get('/categories/trends', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency, include_subcategories = false } = req.query;
    
    const trends = await db.all(`
      WITH RECURSIVE monthly_totals AS (
        SELECT 
          c.id,
          c.name,
          c.type,
          c.parent_id,
          strftime('%Y-%m', t.date) as period,
          SUM(t.amount) as total_amount,
          COUNT(t.id) as transaction_count,
          t.currency
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.date BETWEEN ? AND ?
        ${currency ? 'AND t.currency = ?' : ''}
        ${include_subcategories ? '' : 'AND c.parent_id IS NULL'}
        GROUP BY c.id, period, t.currency
      )
      SELECT 
        *,
        SUM(total_amount) OVER (
          PARTITION BY id, currency
          ORDER BY period
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) as running_total
      FROM monthly_totals
      ORDER BY id, period;
    `, [start_date, end_date, ...(currency ? [currency] : [])]);

    res.json(trends);
  } catch (error) {
    console.error('Error in category trends:', error);
    throw new APIError(500, 'Failed to generate category trends', error);
  }
});

// Get investments with error handling
router.get('/investments', validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, type, currency } = req.query;
    
    if (!db) {
      throw new APIError(500, 'Database not initialized');
    }
    
    const performance = await db.all(`
      SELECT 
        i.name,
        i.type,
        i.amount as initial_investment,
        i.current_value,
        i.currency,
        i.purchase_date,
        ((i.current_value - i.amount) / i.amount * 100) as return_percentage
      FROM investments i
      ORDER BY return_percentage DESC
    `);

    res.json(performance);
  } catch (error) {
    console.error('Error in investments:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Failed to generate investment performance', error);
  }
});

// Get debt with authorization
router.get('/debt', authorize(['admin']), validateReportParams, async (req, res) => {
  try {
    const { status, currency } = req.query;
    
    const analysis = await db.all(`
      SELECT 
        l.name,
        l.amount,
        l.currency,
        l.interest_rate,
        l.term_months,
        l.start_date,
        l.due_date,
        l.status,
        ba.name as bank_account,
        SUM(p.amount) as total_paid,
        l.amount - SUM(p.amount) as remaining_amount,
        (l.amount - SUM(p.amount)) / l.amount * 100 as remaining_percentage,
        (julianday(l.due_date) - julianday('now')) as days_remaining
      FROM loans l
      LEFT JOIN bank_accounts ba ON l.bank_account_id = ba.id
      LEFT JOIN loan_payments p ON l.id = p.loan_id
      WHERE 1=1
      ${status ? 'AND l.status = ?' : ''}
      ${currency ? 'AND l.currency = ?' : ''}
      GROUP BY l.id
      ORDER BY days_remaining ASC
    `, [...(status ? [status] : []), ...(currency ? [currency] : [])]);

    res.json(analysis);
  } catch (error) {
    console.error('Error in debt analysis:', error);
    throw new APIError(500, 'Failed to generate debt analysis', error);
  }
});

// Export with format validation
router.get('/export', validateReportParams, async (req, res) => {
  try {
    const { report_type, start_date, end_date, currency, format = 'excel' } = req.query;
    
    if (!['excel', 'pdf', 'csv'].includes(format)) {
      throw new APIError(400, 'Invalid export format');
    }
    
    let data, columns, styles;
    
    switch (report_type) {
      case 'transactions':
        data = await db.all(`
          SELECT 
            t.date,
            t.amount,
            t.currency,
            t.description,
            c.name as category,
            ba.name as account,
            cc.name as card,
            t.is_recurring,
            t.is_unplanned,
            t.is_entitlement,
            t.notes
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          LEFT JOIN bank_accounts ba ON t.account_id = ba.id
          LEFT JOIN credit_cards cc ON t.card_id = cc.id
          WHERE t.date BETWEEN ? AND ?
          ORDER BY t.date DESC
        `, [start_date, end_date]);
        
        columns = [
          { header: 'Date', key: 'date' },
          { header: 'Amount', key: 'amount' },
          { header: 'Currency', key: 'currency' },
          { header: 'Description', key: 'description' },
          { header: 'Category', key: 'category' },
          { header: 'Account', key: 'account' },
          { header: 'Card', key: 'card' },
          { header: 'Recurring', key: 'is_recurring' },
          { header: 'Unplanned', key: 'is_unplanned' },
          { header: 'Entitlement', key: 'is_entitlement' },
          { header: 'Notes', key: 'notes' }
        ];
        break;
        
      case 'investments':
        data = await db.all(`
          SELECT 
            name,
            type,
            amount,
            current_value,
            currency,
            purchase_date,
            ((current_value - amount) / amount * 100) as return_percentage
          FROM investments
          ORDER BY return_percentage DESC
        `);
        
        columns = [
          { header: 'Name', key: 'name' },
          { header: 'Type', key: 'type' },
          { header: 'Initial Investment', key: 'amount' },
          { header: 'Current Value', key: 'current_value' },
          { header: 'Currency', key: 'currency' },
          { header: 'Purchase Date', key: 'purchase_date' },
          { header: 'Return %', key: 'return_percentage' }
        ];
        break;
        
      case 'net-worth':
        const netWorthData = await db.all(`
          SELECT 
            'Bank Accounts' as type,
            SUM(balance) as amount,
            currency
          FROM bank_accounts
          GROUP BY currency
          UNION ALL
          SELECT 
            'Investments' as type,
            SUM(current_value) as amount,
            currency
          FROM investments
          GROUP BY currency
          UNION ALL
          SELECT 
            'Saving Goals' as type,
            SUM(current_amount) as amount,
            currency
          FROM saving_goals
          GROUP BY currency
          UNION ALL
          SELECT 
            'Credit Cards' as type,
            -SUM(balance) as amount,
            currency
          FROM credit_cards
          GROUP BY currency
          UNION ALL
          SELECT 
            'Loans' as type,
            -SUM(amount) as amount,
            currency
          FROM loans
          GROUP BY currency
        `);
        
        data = netWorthData;
        columns = [
          { header: 'Type', key: 'type' },
          { header: 'Amount', key: 'amount' },
          { header: 'Currency', key: 'currency' }
        ];
        break;

      case 'cash-flow':
        data = await db.all(`
          SELECT 
            strftime('%Y-%m', date) as period,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
            SUM(amount) as net_cash_flow,
            currency
          FROM transactions
          WHERE date BETWEEN ? AND ?
          ${currency ? 'AND currency = ?' : ''}
          GROUP BY period, currency
          ORDER BY period ASC
        `, [start_date, end_date, ...(currency ? [currency] : [])]);
        
        columns = [
          { header: 'Period', key: 'period' },
          { header: 'Income', key: 'income' },
          { header: 'Expenses', key: 'expenses' },
          { header: 'Net Cash Flow', key: 'net_cash_flow' },
          { header: 'Currency', key: 'currency' }
        ];
        break;

      case 'budget-vs-actual':
        data = await db.all(`
          SELECT 
            c.name as category,
            c.type,
            b.amount as budgeted_amount,
            SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) as actual_amount,
            t.currency,
            (b.amount - ABS(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END))) as variance,
            ((b.amount - ABS(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END))) / b.amount * 100) as variance_percentage
          FROM categories c
          LEFT JOIN budgets b ON c.id = b.category_id
          LEFT JOIN transactions t ON c.id = t.category_id
          WHERE t.date BETWEEN ? AND ?
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY c.id, t.currency
          ORDER BY variance_percentage DESC
        `, [start_date, end_date, ...(currency ? [currency] : [])]);
        
        columns = [
          { header: 'Category', key: 'category' },
          { header: 'Type', key: 'type' },
          { header: 'Budgeted Amount', key: 'budgeted_amount' },
          { header: 'Actual Amount', key: 'actual_amount' },
          { header: 'Variance', key: 'variance' },
          { header: 'Variance %', key: 'variance_percentage' },
          { header: 'Currency', key: 'currency' }
        ];
        break;

      case 'recurring':
        data = await db.all(`
          SELECT 
            t.description,
            t.amount,
            t.currency,
            c.name as category,
            COUNT(t.id) as occurrence_count,
            MIN(t.date) as first_occurrence,
            MAX(t.date) as last_occurrence,
            AVG(t.amount) as average_amount
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.is_recurring = 1
          AND t.date BETWEEN ? AND ?
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY t.description, t.amount, t.currency, c.id
          ORDER BY occurrence_count DESC
        `, [start_date, end_date, ...(currency ? [currency] : [])]);
        
        columns = [
          { header: 'Description', key: 'description' },
          { header: 'Amount', key: 'amount' },
          { header: 'Currency', key: 'currency' },
          { header: 'Category', key: 'category' },
          { header: 'Occurrences', key: 'occurrence_count' },
          { header: 'First Occurrence', key: 'first_occurrence' },
          { header: 'Last Occurrence', key: 'last_occurrence' },
          { header: 'Average Amount', key: 'average_amount' }
        ];
        break;

      case 'investment-performance':
        data = await db.all(`
          SELECT 
            i.name,
            i.type,
            i.amount as initial_investment,
            i.current_value,
            i.currency,
            i.purchase_date,
            ((i.current_value - i.amount) / i.amount * 100) as return_percentage,
            ((i.current_value - i.amount) / i.amount * 100) / 
              (julianday('now') - julianday(i.purchase_date)) * 365 as annualized_return,
            COUNT(t.id) as transaction_count,
            SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_invested,
            SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) as total_withdrawn
          FROM investments i
          LEFT JOIN transactions t ON i.id = t.investment_id
          WHERE 1=1
          ${start_date ? 'AND i.purchase_date >= ?' : ''}
          ${end_date ? 'AND i.purchase_date <= ?' : ''}
          ${currency ? 'AND i.currency = ?' : ''}
          GROUP BY i.id
          ORDER BY return_percentage DESC
        `, [
          ...(start_date ? [start_date] : []),
          ...(end_date ? [end_date] : []),
          ...(currency ? [currency] : [])
        ]);
        
        columns = [
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Type', key: 'type', width: 15 },
          { header: 'Initial Investment', key: 'initial_investment', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Current Value', key: 'current_value', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Currency', key: 'currency', width: 10 },
          { header: 'Purchase Date', key: 'purchase_date', width: 15 },
          { header: 'Return %', key: 'return_percentage', width: 15, style: { numFmt: '0.00%' } },
          { header: 'Annualized Return %', key: 'annualized_return', width: 20, style: { numFmt: '0.00%' } },
          { header: 'Transactions', key: 'transaction_count', width: 15 },
          { header: 'Total Invested', key: 'total_invested', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Total Withdrawn', key: 'total_withdrawn', width: 20, style: { numFmt: '#,##0.00' } }
        ];
        break;

      case 'debt-analysis':
        data = await db.all(`
          SELECT 
            l.name,
            l.amount,
            l.currency,
            l.interest_rate,
            l.term_months,
            l.start_date,
            l.due_date,
            l.status,
            ba.name as bank_account,
            SUM(p.amount) as total_paid,
            l.amount - SUM(p.amount) as remaining_amount,
            (l.amount - SUM(p.amount)) / l.amount * 100 as remaining_percentage,
            (julianday(l.due_date) - julianday('now')) as days_remaining
          FROM loans l
          LEFT JOIN bank_accounts ba ON l.bank_account_id = ba.id
          LEFT JOIN loan_payments p ON l.id = p.loan_id
          WHERE 1=1
          ${currency ? 'AND l.currency = ?' : ''}
          GROUP BY l.id
          ORDER BY days_remaining ASC
        `, [...(currency ? [currency] : [])]);
        
        columns = [
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Amount', key: 'amount', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Currency', key: 'currency', width: 10 },
          { header: 'Interest Rate', key: 'interest_rate', width: 15, style: { numFmt: '0.00%' } },
          { header: 'Term (Months)', key: 'term_months', width: 15 },
          { header: 'Start Date', key: 'start_date', width: 15 },
          { header: 'Due Date', key: 'due_date', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Bank Account', key: 'bank_account', width: 20 },
          { header: 'Total Paid', key: 'total_paid', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Remaining Amount', key: 'remaining_amount', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Remaining %', key: 'remaining_percentage', width: 15, style: { numFmt: '0.00%' } },
          { header: 'Days Remaining', key: 'days_remaining', width: 15 }
        ];
        break;

      case 'spending-patterns':
        data = await db.all(`
          SELECT 
            strftime('%w', date) as day_of_week,
            strftime('%H', date) as hour_of_day,
            c.name as category,
            ba.name as account,
            COUNT(*) as transaction_count,
            SUM(amount) as total_amount,
            AVG(amount) as average_amount,
            t.currency
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          LEFT JOIN bank_accounts ba ON t.account_id = ba.id
          WHERE 1=1
          ${start_date ? 'AND t.date >= ?' : ''}
          ${end_date ? 'AND t.date <= ?' : ''}
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY day_of_week, hour_of_day, c.id, ba.id, t.currency
          ORDER BY transaction_count DESC
        `, [
          ...(start_date ? [start_date] : []),
          ...(end_date ? [end_date] : []),
          ...(currency ? [currency] : [])
        ]);
        
        columns = [
          { header: 'Day of Week', key: 'day_of_week', width: 15 },
          { header: 'Hour of Day', key: 'hour_of_day', width: 15 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Account', key: 'account', width: 20 },
          { header: 'Transaction Count', key: 'transaction_count', width: 20 },
          { header: 'Total Amount', key: 'total_amount', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Average Amount', key: 'average_amount', width: 20, style: { numFmt: '#,##0.00' } },
          { header: 'Currency', key: 'currency', width: 10 }
        ];
        break;

      default:
        throw new APIError(400, 'Invalid report type');
    }

    switch (format.toLowerCase()) {
      case 'excel':
        const buffer = await exportToExcel(data, columns, `${report_type}_report.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${report_type}_report.xlsx`);
        res.send(buffer);
        break;

      case 'pdf':
        const pdfBuffer = await exportToPDF(data, columns, `${report_type}_report.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${report_type}_report.pdf`);
        res.send(pdfBuffer);
        break;

      case 'csv':
        const csvBuffer = await exportToCSV(data, columns, `${report_type}_report.csv`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${report_type}_report.csv`);
        res.send(csvBuffer);
        break;

      default:
        throw new APIError(400, 'Invalid export format');
    }
  } catch (error) {
    console.error('Error in export:', error);
    throw new APIError(500, 'Failed to export report', error);
  }
});

// Additional materialized views for enhanced category analysis
const createEnhancedCategoryViews = async () => {
  try {
    await db.exec(`
      -- Category monthly trends
      CREATE TABLE IF NOT EXISTS mv_category_monthly_trends (
        category_id INTEGER,
        period TEXT,
        total_amount DECIMAL(15,2),
        transaction_count INTEGER,
        average_amount DECIMAL(15,2),
        min_amount DECIMAL(15,2),
        max_amount DECIMAL(15,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, period, currency)
      );

      -- Category comparison
      CREATE TABLE IF NOT EXISTS mv_category_comparison (
        category_id INTEGER,
        comparison_period TEXT,
        current_amount DECIMAL(15,2),
        previous_amount DECIMAL(15,2),
        change_percentage DECIMAL(10,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, comparison_period, currency)
      );

      -- Category patterns
      CREATE TABLE IF NOT EXISTS mv_category_patterns (
        category_id INTEGER,
        day_of_week INTEGER,
        hour_of_day INTEGER,
        total_amount DECIMAL(15,2),
        transaction_count INTEGER,
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, day_of_week, hour_of_day, currency)
      );
    `);
  } catch (error) {
    console.error('Failed to create enhanced category views:', error);
  }
};

// Refresh enhanced category views
const refreshEnhancedCategoryViews = async () => {
  try {
    const now = new Date().toISOString();
    await db.exec(`
      BEGIN TRANSACTION;

      -- Refresh monthly trends
      INSERT OR REPLACE INTO mv_category_monthly_trends
      SELECT 
        category_id,
        strftime('%Y-%m', date) as period,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as average_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount,
        currency,
        ? as last_updated
      FROM transactions
      GROUP BY category_id, period, currency;

      -- Refresh category comparison
      INSERT OR REPLACE INTO mv_category_comparison
      WITH monthly_totals AS (
        SELECT 
          category_id,
          period,
          total_amount,
          currency
        FROM mv_category_monthly_trends
      )
      SELECT 
        t1.category_id,
        t1.period as comparison_period,
        t1.total_amount as current_amount,
        t2.total_amount as previous_amount,
        ((t1.total_amount - t2.total_amount) / ABS(t2.total_amount) * 100) as change_percentage,
        t1.currency,
        ? as last_updated
      FROM monthly_totals t1
      JOIN monthly_totals t2 ON t1.period = t2.period AND t1.currency = t2.currency
      WHERE t1.category_id < t2.category_id
      GROUP BY t1.category_id, t2.category_id, t1.currency;

      -- Refresh category patterns
      INSERT OR REPLACE INTO mv_category_patterns
      SELECT 
        category_id,
        CAST(strftime('%w', date) as INTEGER) as day_of_week,
        CAST(strftime('%H', date) as INTEGER) as hour_of_day,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        currency,
        ? as last_updated
      FROM transactions
      GROUP BY category_id, day_of_week, hour_of_day, currency;

      COMMIT;
    `, [now, now, now]);
  } catch (error) {
    console.error('Failed to refresh enhanced category views:', error);
    await db.exec('ROLLBACK;');
  }
};

// Initialize enhanced category views
createEnhancedCategoryViews();

// Schedule enhanced category view refresh
setInterval(refreshEnhancedCategoryViews, 3600000); // Refresh every hour

// Enhanced category endpoints
router.get('/categories/analysis', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency, type, include_subcategories = false } = req.query;
    
    const analysis = await db.all(`
      WITH RECURSIVE category_analysis AS (
        SELECT 
          c.id,
          c.name,
          c.type,
          c.parent_id,
          COUNT(DISTINCT t.date) as active_days,
          COUNT(t.id) as transaction_count,
          SUM(t.amount) as total_amount,
          AVG(t.amount) as average_amount,
          MIN(t.amount) as min_amount,
          MAX(t.amount) as max_amount,
          t.currency,
          GROUP_CONCAT(DISTINCT strftime('%Y-%m', t.date)) as active_months
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.date BETWEEN ? AND ?
        ${type ? 'AND c.type = ?' : ''}
        ${currency ? 'AND t.currency = ?' : ''}
        ${include_subcategories ? '' : 'AND c.parent_id IS NULL'}
        GROUP BY c.id, t.currency
      ),
      subcategory_analysis AS (
        SELECT 
          c.parent_id,
          COUNT(DISTINCT sc.id) as subcategory_count,
          SUM(ca.transaction_count) as total_transactions,
          SUM(ca.total_amount) as total_amount,
          ca.currency
        FROM category_analysis ca
        JOIN categories c ON ca.id = c.id
        JOIN categories sc ON sc.parent_id = c.id
        GROUP BY c.parent_id, ca.currency
      )
      SELECT 
        ca.*,
        sa.subcategory_count,
        sa.total_transactions,
        sa.total_amount as subcategories_total,
        CASE 
          WHEN ca.parent_id IS NULL THEN 'parent'
          ELSE 'child'
        END as category_level
      FROM category_analysis ca
      LEFT JOIN subcategory_analysis sa ON ca.id = sa.parent_id AND ca.currency = sa.currency
      ORDER BY ca.total_amount DESC;
    `, [start_date, end_date, ...(type ? [type] : []), ...(currency ? [currency] : [])]);

    res.json(analysis);
  } catch (error) {
    console.error('Error in category analysis:', error);
    throw new APIError(500, 'Failed to generate category analysis', error);
  }
});

router.get('/categories/patterns', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency, category_id } = req.query;
    
    const patterns = await db.all(`
      SELECT 
        c.name as category_name,
        cp.day_of_week,
        cp.hour_of_day,
        cp.total_amount,
        cp.transaction_count,
        cp.currency,
        (cp.total_amount / SUM(cp.total_amount) OVER (PARTITION BY cp.category_id, cp.currency)) * 100 as percentage
      FROM mv_category_patterns cp
      JOIN categories c ON cp.category_id = c.id
      WHERE 1=1
      ${category_id ? 'AND cp.category_id = ?' : ''}
      ${currency ? 'AND cp.currency = ?' : ''}
      ORDER BY cp.category_id, cp.day_of_week, cp.hour_of_day;
    `, [...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);

    res.json(patterns);
  } catch (error) {
    console.error('Error in category patterns:', error);
    throw new APIError(500, 'Failed to generate category patterns', error);
  }
});

router.get('/categories/comparison', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { period = 'month', currency, category_id } = req.query;
    
    const comparison = await db.all(`
      SELECT 
        c.name as category_name,
        cc.comparison_period,
        cc.current_amount,
        cc.previous_amount,
        cc.change_percentage,
        cc.currency
      FROM mv_category_comparison cc
      JOIN categories c ON cc.category_id = c.id
      WHERE 1=1
      ${category_id ? 'AND cc.category_id = ?' : ''}
      ${currency ? 'AND cc.currency = ?' : ''}
      ORDER BY cc.comparison_period DESC, cc.change_percentage DESC;
    `, [...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);

    res.json(comparison);
  } catch (error) {
    console.error('Error in category comparison:', error);
    throw new APIError(500, 'Failed to generate category comparison', error);
  }
});

// Enhanced visualization endpoints
router.get('/visualizations/categories', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { type = 'distribution', start_date, end_date, currency, category_id } = req.query;
    
    let data;
    switch (type) {
      case 'distribution':
        data = await db.all(`
          SELECT 
            c.name as category,
            c.type,
            SUM(t.amount) as total_amount,
            COUNT(t.id) as transaction_count,
            t.currency,
            (SUM(t.amount) / SUM(SUM(t.amount)) OVER (PARTITION BY t.currency)) * 100 as percentage
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.date BETWEEN ? AND ?
          ${category_id ? 'AND t.category_id = ?' : ''}
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY c.id, t.currency
          ORDER BY total_amount DESC;
        `, [start_date, end_date, ...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);
        break;

      case 'trends':
        data = await db.all(`
          SELECT 
            c.name as category,
            strftime('%Y-%m', t.date) as period,
            SUM(t.amount) as total_amount,
            COUNT(t.id) as transaction_count,
            t.currency
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.date BETWEEN ? AND ?
          ${category_id ? 'AND t.category_id = ?' : ''}
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY c.id, period, t.currency
          ORDER BY period, total_amount DESC;
        `, [start_date, end_date, ...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);
        break;

      case 'patterns':
        data = await db.all(`
          SELECT 
            c.name as category,
            cp.day_of_week,
            cp.hour_of_day,
            cp.total_amount,
            cp.transaction_count,
            cp.currency
          FROM mv_category_patterns cp
          JOIN categories c ON cp.category_id = c.id
          WHERE 1=1
          ${category_id ? 'AND cp.category_id = ?' : ''}
          ${currency ? 'AND cp.currency = ?' : ''}
          ORDER BY cp.day_of_week, cp.hour_of_day;
        `, [...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);
        break;

      default:
        throw new APIError(400, 'Invalid visualization type');
    }

    res.json(data);
  } catch (error) {
    console.error('Error in category visualizations:', error);
    throw new APIError(500, 'Failed to generate category visualizations', error);
  }
});

// Additional materialized views for advanced analytics
const createAdvancedAnalyticsViews = async () => {
  try {
    await db.exec(`
      -- Category anomalies
      CREATE TABLE IF NOT EXISTS mv_category_anomalies (
        category_id INTEGER,
        period TEXT,
        amount DECIMAL(15,2),
        expected_amount DECIMAL(15,2),
        deviation_percentage DECIMAL(10,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category_id, period, currency)
      );

      -- Category correlations
      CREATE TABLE IF NOT EXISTS mv_category_correlations (
        category1_id INTEGER,
        category2_id INTEGER,
        correlation_coefficient DECIMAL(10,2),
        currency TEXT,
        last_updated TIMESTAMP,
        PRIMARY KEY (category1_id, category2_id, currency)
      );

      -- User report preferences
      CREATE TABLE IF NOT EXISTS mv_user_report_preferences (
        user_id INTEGER,
        report_type TEXT,
        configuration JSON,
        schedule TEXT,
        email_notification BOOLEAN,
        last_updated TIMESTAMP,
        PRIMARY KEY (user_id, report_type)
      );

      -- Performance metrics
      CREATE TABLE IF NOT EXISTS mv_performance_metrics (
        metric_type TEXT,
        period TEXT,
        value DECIMAL(15,2),
        details JSON,
        last_updated TIMESTAMP,
        PRIMARY KEY (metric_type, period)
      );
    `);
  } catch (error) {
    console.error('Failed to create advanced analytics views:', error);
  }
};

// Refresh advanced analytics views
const refreshAdvancedAnalyticsViews = async () => {
  try {
    const now = new Date().toISOString();
    await db.exec(`
      BEGIN TRANSACTION;

      -- Refresh category anomalies
      WITH monthly_avg AS (
        SELECT 
          category_id,
          currency,
          AVG(amount) as avg_amount,
          STDDEV(amount) as std_amount
        FROM mv_category_monthly_trends
        GROUP BY category_id, currency
      )
      INSERT OR REPLACE INTO mv_category_anomalies
      SELECT 
        mt.category_id,
        mt.period,
        mt.total_amount,
        ma.avg_amount as expected_amount,
        ((mt.total_amount - ma.avg_amount) / ma.avg_amount * 100) as deviation_percentage,
        mt.currency,
        ? as last_updated
      FROM mv_category_monthly_trends mt
      JOIN monthly_avg ma ON mt.category_id = ma.category_id AND mt.currency = ma.currency
      WHERE ABS(mt.total_amount - ma.avg_amount) > (ma.std_amount * 2);

      -- Refresh category correlations
      INSERT OR REPLACE INTO mv_category_correlations
      WITH monthly_totals AS (
        SELECT 
          category_id,
          period,
          total_amount,
          currency
        FROM mv_category_monthly_trends
      )
      SELECT 
        t1.category_id as category1_id,
        t2.category_id as category2_id,
        CORR(t1.total_amount, t2.total_amount) as correlation_coefficient,
        t1.currency,
        ? as last_updated
      FROM monthly_totals t1
      JOIN monthly_totals t2 ON t1.period = t2.period AND t1.currency = t2.currency
      WHERE t1.category_id < t2.category_id
      GROUP BY t1.category_id, t2.category_id, t1.currency;

      -- Refresh performance metrics
      INSERT OR REPLACE INTO mv_performance_metrics
      SELECT 
        'query_time' as metric_type,
        strftime('%Y-%m-%d', datetime('now')) as period,
        AVG(duration) as value,
        json_object(
          'min', MIN(duration),
          'max', MAX(duration),
          'count', COUNT(*)
        ) as details,
        ? as last_updated
      FROM metrics.queryTimes
      WHERE timestamp >= datetime('now', '-1 day');

      COMMIT;
    `, [now, now, now]);
  } catch (error) {
    console.error('Failed to refresh advanced analytics views:', error);
    await db.exec('ROLLBACK;');
  }
};

// Initialize advanced analytics views
createAdvancedAnalyticsViews();

// Schedule advanced analytics view refresh
setInterval(refreshAdvancedAnalyticsViews, 3600000); // Refresh every hour

// Add export functionality for categories
router.get('/categories/export', validateReportParams, async (req, res) => {
  try {
    const { type = 'excel', start_date, end_date, currency, category_id } = req.query;
    
    let data, columns;
    switch (type) {
      case 'excel':
        data = await db.all(`
          SELECT 
            c.name as category,
            c.type,
            strftime('%Y-%m', t.date) as period,
            SUM(t.amount) as total_amount,
            COUNT(t.id) as transaction_count,
            AVG(t.amount) as average_amount,
            MIN(t.amount) as min_amount,
            MAX(t.amount) as max_amount,
            t.currency
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.date BETWEEN ? AND ?
          ${category_id ? 'AND t.category_id = ?' : ''}
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY c.id, period, t.currency
          ORDER BY period, total_amount DESC;
        `, [start_date, end_date, ...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);
        
        columns = [
          { header: 'Category', key: 'category' },
          { header: 'Type', key: 'type' },
          { header: 'Period', key: 'period' },
          { header: 'Total Amount', key: 'total_amount', style: { numFmt: '#,##0.00' } },
          { header: 'Transaction Count', key: 'transaction_count' },
          { header: 'Average Amount', key: 'average_amount', style: { numFmt: '#,##0.00' } },
          { header: 'Min Amount', key: 'min_amount', style: { numFmt: '#,##0.00' } },
          { header: 'Max Amount', key: 'max_amount', style: { numFmt: '#,##0.00' } },
          { header: 'Currency', key: 'currency' }
        ];
        break;

      case 'csv':
        data = await db.all(`
          SELECT 
            c.name as category,
            c.type,
            strftime('%Y-%m', t.date) as period,
            SUM(t.amount) as total_amount,
            COUNT(t.id) as transaction_count,
            t.currency
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.date BETWEEN ? AND ?
          ${category_id ? 'AND t.category_id = ?' : ''}
          ${currency ? 'AND t.currency = ?' : ''}
          GROUP BY c.id, period, t.currency
          ORDER BY period, total_amount DESC;
        `, [start_date, end_date, ...(category_id ? [category_id] : []), ...(currency ? [currency] : [])]);
        
        columns = [
          'Category',
          'Type',
          'Period',
          'Total Amount',
          'Transaction Count',
          'Currency'
        ];
        break;

      default:
        throw new APIError(400, 'Invalid export type');
    }

    const buffer = await exportToFormat(data, columns, type);
    res.setHeader('Content-Type', getContentType(type));
    res.setHeader('Content-Disposition', `attachment; filename=category_report.${type}`);
    res.send(buffer);
  } catch (error) {
    console.error('Error in category export:', error);
    throw new APIError(500, 'Failed to export category report', error);
  }
});

// Helper functions
function getContentType(type) {
  switch (type) {
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}

async function exportToFormat(data, columns, type) {
  switch (type) {
    case 'excel':
      return await exportToExcel(data, columns);
    case 'csv':
      return await exportToCSV(data, columns);
    default:
      throw new APIError(400, 'Unsupported export format');
  }
}

// Add advanced analytics endpoints
router.get('/categories/anomalies', cache(cacheStrategies.timeBased.medium), validateReportParams, async (req, res) => {
  try {
    const { start_date, end_date, currency, threshold = 2 } = req.query;
    
    const anomalies = await db.all(`
      WITH monthly_avg AS (
        SELECT 
          category_id,
          currency,
          AVG(total_amount) as avg_amount,
          STDDEV(total_amount) as std_amount
        FROM mv_category_monthly_trends
        GROUP BY category_id, currency
      )
      SELECT 
        c.name as category,
        mt.period,
        mt.total_amount as amount,
        ma.avg_amount as expected_amount,
        ((mt.total_amount - ma.avg_amount) / ma.avg_amount * 100) as deviation_percentage,
        mt.currency
      FROM mv_category_monthly_trends mt
      JOIN monthly_avg ma ON mt.category_id = ma.category_id AND mt.currency = ma.currency
      JOIN categories c ON mt.category_id = c.id
      WHERE mt.period BETWEEN ? AND ?
      ${currency ? 'AND mt.currency = ?' : ''}
      AND ABS(mt.total_amount - ma.avg_amount) > (ma.std_amount * ?)
      ORDER BY ABS(deviation_percentage) DESC;
    `, [start_date, end_date, ...(currency ? [currency] : []), threshold]);

    res.json(anomalies);
  } catch (error) {
    console.error('Error in category anomalies:', error);
    throw new APIError(500, 'Failed to generate category anomalies', error);
  }
});

router.get('/categories/correlations', cache(cacheStrategies.timeBased.long), validateReportParams, async (req, res) => {
  try {
    const { currency, min_correlation = 0.5 } = req.query;
    
    const correlations = await db.all(`
      WITH monthly_totals AS (
        SELECT 
          category_id,
          period,
          total_amount,
          currency
        FROM mv_category_monthly_trends
      )
      SELECT 
        c1.name as category1,
        c2.name as category2,
        CORR(t1.total_amount, t2.total_amount) as correlation_coefficient,
        t1.currency
      FROM monthly_totals t1
      JOIN monthly_totals t2 ON t1.period = t2.period AND t1.currency = t2.currency
      JOIN categories c1 ON t1.category_id = c1.id
      JOIN categories c2 ON t2.category_id = c2.id
      WHERE t1.category_id < t2.category_id
      ${currency ? 'AND t1.currency = ?' : ''}
      GROUP BY t1.category_id, t2.category_id, t1.currency
      HAVING ABS(correlation_coefficient) >= ?
      ORDER BY ABS(correlation_coefficient) DESC;
    `, [...(currency ? [currency] : []), min_correlation]);

    res.json(correlations);
  } catch (error) {
    console.error('Error in category correlations:', error);
    throw new APIError(500, 'Failed to generate category correlations', error);
  }
});

// Add user preferences endpoints
router.post('/preferences', authenticate, async (req, res) => {
  try {
    const { report_type, configuration, schedule, email_notification } = req.body;
    const user_id = req.user.id;

    await db.run(`
      INSERT OR REPLACE INTO mv_user_report_preferences
      VALUES (?, ?, ?, ?, ?, ?);
    `, [user_id, report_type, JSON.stringify(configuration), schedule, email_notification, new Date().toISOString()]);

    res.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw new APIError(500, 'Failed to save preferences', error);
  }
});

router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    const preferences = await db.all(`
      SELECT 
        report_type,
        configuration,
        schedule,
        email_notification
      FROM mv_user_report_preferences
      WHERE user_id = ?;
    `, [user_id]);

    res.json(preferences);
  } catch (error) {
    console.error('Error getting preferences:', error);
    throw new APIError(500, 'Failed to get preferences', error);
  }
});

// Add performance monitoring endpoints
router.get('/performance', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    const metrics = await db.all(`
      SELECT 
        metric_type,
        value,
        details
      FROM mv_performance_metrics
      WHERE period = strftime('%Y-%m-%d', datetime('now', ?));
    `, [period === 'day' ? '0 days' : '-7 days']);

    res.json(metrics);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    throw new APIError(500, 'Failed to get performance metrics', error);
  }
});

// Add AI Financial Advisor endpoints
router.post('/ai/insights', authenticate, authorize(['admin']), validateTimeframe, aiLimiter, cacheMiddleware, async (req, res) => {
  try {
    const { query, timeframe = '3m', currency, customPeriod } = req.body;
    const user_id = req.user.id;
    const sanitizedQuery = sanitizeInput(query);

    // Handle custom period if provided
    const dateFilter = customPeriod 
      ? `t.date BETWEEN datetime('${customPeriod.start}') AND datetime('${customPeriod.end}')`
      : `t.date >= datetime('now', '-${timeframe}')`;

    // Get all relevant data for analysis
    const [transactions, investments, loans, insurances, business] = await Promise.all([
      // Get transactions
      db.all(`
        SELECT t.*, c.name as category
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE ${dateFilter}
        ${currency ? 'AND t.currency = ?' : ''}
      `, ...(currency ? [currency] : [])),
      
      // Get investments
      db.all('SELECT * FROM investments WHERE user_id = ?', [user_id]),
      
      // Get loans
      db.all('SELECT * FROM loans WHERE user_id = ?', [user_id]),
      
      // Get insurances
      db.all('SELECT * FROM insurances WHERE user_id = ?', [user_id]),
      
      // Get business
      db.get('SELECT * FROM businesses WHERE user_id = ?', [user_id])
    ]);

    // Generate forecast models
    const forecastModels = {
      linear: generateLinearForecast(transactions),
      exponential: generateExponentialForecast(transactions),
      seasonal: generateSeasonalForecast(transactions),
      category: generateCategoryForecast(transactions)
    };

    // Perform comprehensive analysis
    const [investmentAnalysis, loanAnalysis, insuranceAnalysis, businessAnalysis, currencyAnalysis] = await Promise.all([
      analyzeInvestments(investments, forecastModels),
      analyzeLoans(loans, forecastModels),
      analyzeInsurance(insurances, forecastModels),
      analyzeBusiness(business, forecastModels),
      analyzeMultiCurrency([...transactions, ...investments], currency || 'USD')
    ]);

    // Generate visualizations
    const visualizations = generateVisualizationData({
      investment: investmentAnalysis,
      loan: loanAnalysis,
      insurance: insuranceAnalysis,
      business: businessAnalysis,
      currency: currencyAnalysis
    });

    // Generate insights using LLM
    const llm = getLLM();
    const insights = await llm.generateInsights({
      query: sanitizedQuery,
      analysis: {
        investment: investmentAnalysis,
        loan: loanAnalysis,
        insurance: insuranceAnalysis,
        business: businessAnalysis,
        currency: currencyAnalysis
      },
      visualizations
    });

    // Cache the results
    if (AI_CONFIG.cache.enabled) {
      aiCache.set(getCacheKey(req), {
        data: insights,
        timestamp: Date.now()
      });
    }
    
    res.json({
      insights,
      visualizations,
      analysis: {
        investment: investmentAnalysis,
        loan: loanAnalysis,
        insurance: insuranceAnalysis,
        business: businessAnalysis,
        currency: currencyAnalysis
      }
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    logAIOperation('ai_insights', null, error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Failed to generate AI insights', error);
  }
});

router.get('/ai/predictions', authenticate, authorize(['admin']), validateTimeframe, cacheMiddleware, async (req, res) => {
  try {
    const { timeframe = '3m', currency, customPeriod } = req.query;
    const user_id = req.user.id;

    // Handle custom period if provided
    const dateFilter = customPeriod 
      ? `t.date BETWEEN datetime('${customPeriod.start}') AND datetime('${customPeriod.end}')`
      : `t.date >= datetime('now', '-${timeframe}')`;

    // Get historical data for prediction
    const historicalData = await db.all(`
      WITH RECURSIVE monthly_totals AS (
        SELECT 
          strftime('%Y-%m', t.date) as period,
          SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as income,
          SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) as expenses,
          COUNT(t.id) as transaction_count,
          t.currency
        FROM transactions t
        WHERE ${dateFilter}
        ${currency ? 'AND t.currency = ?' : ''}
        GROUP BY period, t.currency
      ),
      category_trends AS (
        SELECT 
          c.name as category,
          strftime('%Y-%m', t.date) as period,
          SUM(t.amount) as total_amount,
          COUNT(t.id) as transaction_count,
          t.currency
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE ${dateFilter}
        ${currency ? 'AND t.currency = ?' : ''}
        GROUP BY c.id, period, t.currency
      )
      SELECT 
        json_object(
          'monthly_totals', json_group_array(json_object(
            'period', period,
            'income', income,
            'expenses', expenses,
            'transaction_count', transaction_count,
            'currency', currency
          )),
          'category_trends', json_group_array(json_object(
            'category', category,
            'period', period,
            'total_amount', total_amount,
            'transaction_count', transaction_count,
            'currency', currency
          ))
        ) as prediction_data
      FROM (
        SELECT * FROM monthly_totals
        UNION ALL
        SELECT * FROM category_trends
      );
    `, [
      ...(currency ? [currency] : []),
      ...(currency ? [currency] : [])
    ]);

    // Generate predictions
    const predictions = await generateAIPredictions(historicalData);
    
    // Cache the results
    cache.set(getCacheKey(req), {
      data: predictions,
      timestamp: Date.now()
    });
    
    res.json(predictions);
  } catch (error) {
    console.error('Error generating AI predictions:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Failed to generate AI predictions', error);
  }
});

// Enhanced helper functions for AI analysis
async function generateAIInsights(data, query) {
  try {
    const analysisData = JSON.parse(data[0].analysis_data);
    
    // Calculate spending trends with more granular analysis
    const monthlyData = analysisData.monthly_data;
    const totalMonths = monthlyData.length;
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[totalMonths - 1];
    
    // Enhanced trend analysis
    const spendingChange = ((lastMonth.expenses - firstMonth.expenses) / Math.abs(firstMonth.expenses)) * 100;
    const incomeChange = ((lastMonth.income - firstMonth.income) / Math.abs(firstMonth.income)) * 100;
    
    // Calculate monthly averages and volatility
    const monthlyAverages = {
      income: monthlyData.reduce((sum, month) => sum + month.income, 0) / totalMonths,
      expenses: monthlyData.reduce((sum, month) => sum + Math.abs(month.expenses), 0) / totalMonths
    };
    
    const incomeVolatility = calculateVolatility(monthlyData.map(m => m.income));
    const expenseVolatility = calculateVolatility(monthlyData.map(m => Math.abs(m.expenses)));
    
    // Analyze category trends with more detail
    const categoryTrends = analysisData.category_trends;
    const categoryAnalysis = {};
    
    categoryTrends.forEach(trend => {
      if (!categoryAnalysis[trend.category]) {
        categoryAnalysis[trend.category] = {
          total: 0,
          count: 0,
          monthly_totals: {},
          trend: []
        };
      }
      categoryAnalysis[trend.category].total += trend.total_amount;
      categoryAnalysis[trend.category].count += trend.transaction_count;
      categoryAnalysis[trend.category].monthly_totals[trend.period] = trend.total_amount;
      categoryAnalysis[trend.category].trend.push({
        period: trend.period,
        amount: trend.total_amount
      });
    });
    
    // Identify top spending categories with trend analysis
    const topCategories = Object.entries(categoryAnalysis)
      .map(([category, data]) => {
        const trend = calculateTrend(data.trend.map(t => t.amount));
        return {
          category,
          total: data.total,
          count: data.count,
          average: data.total / data.count,
          trend: trend,
          volatility: calculateVolatility(Object.values(data.monthly_totals))
        };
      })
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, 5);
    
    // Enhanced spending patterns analysis
    const spendingPatterns = analysisData.spending_patterns;
    const dayOfWeekAnalysis = {};
    const hourOfDayAnalysis = {};
    
    spendingPatterns.forEach(pattern => {
      dayOfWeekAnalysis[pattern.day_of_week] = (dayOfWeekAnalysis[pattern.day_of_week] || 0) + pattern.total_amount;
      hourOfDayAnalysis[pattern.hour_of_day] = (hourOfDayAnalysis[pattern.hour_of_day] || 0) + pattern.total_amount;
    });
    
    // Generate comprehensive insights
    const insights = [];
    
    // Financial Health Score
    const healthScore = calculateFinancialHealthScore({
      incomeChange,
      spendingChange,
      incomeVolatility,
      expenseVolatility,
      savingsRate: (monthlyAverages.income - monthlyAverages.expenses) / monthlyAverages.income
    });
    
    insights.push({
      type: 'financial_health',
      title: 'Financial Health Score',
      score: healthScore.score,
      description: healthScore.description,
      recommendations: healthScore.recommendations
    });
    
    // Spending Trend Analysis
    insights.push({
      type: 'spending_trend',
      title: 'Spending Analysis',
      description: `Your spending has ${spendingChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChange).toFixed(1)}% in the last ${totalMonths} months`,
      details: {
        average_monthly_spending: monthlyAverages.expenses,
        spending_volatility: expenseVolatility,
        trend_strength: Math.abs(spendingChange) > 20 ? 'strong' : Math.abs(spendingChange) > 10 ? 'moderate' : 'weak'
      },
      recommendations: generateSpendingRecommendations(spendingChange, expenseVolatility)
    });
    
    // Income Analysis
    insights.push({
      type: 'income_trend',
      title: 'Income Analysis',
      description: `Your income has ${incomeChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(incomeChange).toFixed(1)}% in the last ${totalMonths} months`,
      details: {
        average_monthly_income: monthlyAverages.income,
        income_volatility: incomeVolatility,
        trend_strength: Math.abs(incomeChange) > 20 ? 'strong' : Math.abs(incomeChange) > 10 ? 'moderate' : 'weak'
      },
      recommendations: generateIncomeRecommendations(incomeChange, incomeVolatility)
    });
    
    // Category Analysis
    topCategories.forEach(category => {
      insights.push({
        type: 'category_analysis',
        title: `${category.category} Spending Analysis`,
        description: `Your average ${category.category} spending is ${Math.abs(category.average).toFixed(2)} per transaction`,
        details: {
          total_spent: category.total,
          transaction_count: category.count,
          trend: category.trend,
          volatility: category.volatility
        },
        recommendations: generateCategoryRecommendations(category)
      });
    });
    
    // Spending Patterns
    const peakDay = Object.entries(dayOfWeekAnalysis)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    const peakHour = Object.entries(hourOfDayAnalysis)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    
    insights.push({
      type: 'spending_pattern',
      title: 'Spending Patterns',
      description: `You tend to spend the most on day ${peakDay[0]} during hour ${peakHour[0]}`,
      details: {
        day_of_week_distribution: dayOfWeekAnalysis,
        hour_of_day_distribution: hourOfDayAnalysis
      },
      recommendations: generatePatternRecommendations(peakDay, peakHour)
    });
    
    return {
      insights,
      query_response: query ? `Based on your query "${query}", here are the key insights...` : 'Here are your financial insights...',
      confidence_score: 0.85,
      analysis_period: {
        start: firstMonth.period,
        end: lastMonth.period,
        total_months: totalMonths
      },
      summary: {
        financial_health: healthScore,
        key_trends: {
          income: { change: incomeChange, volatility: incomeVolatility },
          expenses: { change: spendingChange, volatility: expenseVolatility }
        },
        top_categories: topCategories.map(c => ({
          category: c.category,
          percentage: (Math.abs(c.total) / Math.abs(topCategories[0].total)) * 100
        }))
      }
    };
  } catch (error) {
    console.error('Error in generateAIInsights:', error);
    throw new APIError(500, 'Failed to generate insights', error);
  }
}

async function generateAIPredictions(data) {
  try {
    const analysisData = JSON.parse(data[0].analysis_data);
    const monthlyData = analysisData.monthly_data;
    const categoryTrends = analysisData.category_trends;
    
    // Enhanced forecasting models
    const forecastModels = {
      linear: generateLinearForecast(monthlyData),
      exponential: generateExponentialForecast(monthlyData),
      seasonal: generateSeasonalForecast(monthlyData),
      category: generateCategoryForecast(categoryTrends)
    };
    
    // Risk assessment
    const riskAssessment = {
      income_risk: assessIncomeRisk(monthlyData),
      expense_risk: assessExpenseRisk(monthlyData),
      savings_risk: assessSavingsRisk(monthlyData),
      category_risks: assessCategoryRisks(categoryTrends)
    };
    
    // Goal-based predictions
    const goals = await getFinancialGoals();
    const goalPredictions = goals.map(goal => ({
      goal,
      prediction: predictGoalAchievement(goal, forecastModels, riskAssessment),
      recommendations: generateGoalRecommendations(goal, forecastModels, riskAssessment)
    }));
    
    // Scenario analysis
    const scenarios = generateScenarios(forecastModels, riskAssessment);
    
    return {
      forecast: {
        models: forecastModels,
        confidence_scores: calculateConfidenceScores(forecastModels),
        risk_assessment: riskAssessment
      },
      goals: goalPredictions,
      scenarios: scenarios,
      recommendations: generateOverallRecommendations(forecastModels, riskAssessment, goalPredictions)
    };
  } catch (error) {
    console.error('Error in generateAIPredictions:', error);
    throw new APIError(500, 'Failed to generate predictions', error);
  }
}

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Add BI-Style Dashboard endpoints
router.post('/dashboard', authenticate, async (req, res) => {
  try {
    const { name, layout, widgets } = req.body;
    const user_id = req.user.id;

    await db.run(`
      INSERT INTO dashboards (user_id, name, layout, widgets, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'));
    `, [user_id, name, JSON.stringify(layout), JSON.stringify(widgets)]);

    res.json({ message: 'Dashboard created successfully' });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw new APIError(500, 'Failed to create dashboard', error);
  }
});

router.get('/dashboard/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const dashboard = await db.get(`
      SELECT * FROM dashboards
      WHERE id = ? AND user_id = ?;
    `, [id, user_id]);

    if (!dashboard) {
      throw new APIError(404, 'Dashboard not found');
    }

    res.json(dashboard);
  } catch (error) {
    console.error('Error getting dashboard:', error);
    throw new APIError(500, 'Failed to get dashboard', error);
  }
});

router.put('/dashboard/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, layout, widgets } = req.body;
    const user_id = req.user.id;

    await db.run(`
      UPDATE dashboards
      SET name = ?,
          layout = ?,
          widgets = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?;
    `, [name, JSON.stringify(layout), JSON.stringify(widgets), id, user_id]);

    res.json({ message: 'Dashboard updated successfully' });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw new APIError(500, 'Failed to update dashboard', error);
  }
});

router.get('/dashboard/:id/widgets', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const dashboard = await db.get(`
      SELECT widgets FROM dashboards
      WHERE id = ? AND user_id = ?;
    `, [id, user_id]);

    if (!dashboard) {
      throw new APIError(404, 'Dashboard not found');
    }

    const widgets = JSON.parse(dashboard.widgets);
    const widgetData = await Promise.all(
      widgets.map(async (widget) => {
        const data = await getWidgetData(widget);
        return { ...widget, data };
      })
    );

    res.json(widgetData);
  } catch (error) {
    console.error('Error getting widget data:', error);
    throw new APIError(500, 'Failed to get widget data', error);
  }
});

// Helper function to get widget data
async function getWidgetData(widget) {
  const { type, config } = widget;
  
  switch (type) {
    case 'summary':
      return await getSummaryData(config);
    case 'trend':
      return await getTrendData(config);
    case 'category':
      return await getCategoryData(config);
    case 'forecast':
      return await getForecastData(config);
    default:
      throw new APIError(400, 'Invalid widget type');
  }
}

async function getSummaryData(config) {
  const { timeframe = '1m', currency } = config;
  
  return await db.get(`
    SELECT 
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
      SUM(amount) as net_flow,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE date >= datetime('now', ?)
    ${currency ? 'AND currency = ?' : ''}
  `, [`-${timeframe}`, ...(currency ? [currency] : [])]);
}

async function getTrendData(config) {
  const { timeframe = '3m', currency, type } = config;
  
  return await db.all(`
    SELECT 
      strftime('%Y-%m', date) as period,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
      SUM(amount) as net_flow
    FROM transactions
    WHERE date >= datetime('now', ?)
    ${currency ? 'AND currency = ?' : ''}
    GROUP BY period
    ORDER BY period;
  `, [`-${timeframe}`, ...(currency ? [currency] : [])]);
}

async function getCategoryData(config) {
  const { timeframe = '1m', currency, limit = 5 } = config;
  
  return await db.all(`
    SELECT 
      c.name as category,
      SUM(t.amount) as total_amount,
      COUNT(t.id) as transaction_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date >= datetime('now', ?)
    ${currency ? 'AND t.currency = ?' : ''}
    GROUP BY c.id
    ORDER BY ABS(total_amount) DESC
    LIMIT ?;
  `, [`-${timeframe}`, ...(currency ? [currency] : []), limit]);
}

async function getForecastData(config) {
  const { timeframe = '3m', currency } = config;
  
  // Get historical data
  const historicalData = await db.all(`
    SELECT 
      strftime('%Y-%m', date) as period,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE date >= datetime('now', ?)
    ${currency ? 'AND currency = ?' : ''}
    GROUP BY period
    ORDER BY period;
  `, [`-${timeframe}`, ...(currency ? [currency] : [])]);

  // Generate forecast (simplified for now)
  return {
    historical: historicalData,
    forecast: generateForecast(historicalData)
  };
}

function generateForecast(historicalData) {
  // Simple linear regression for demonstration
  const periods = historicalData.length;
  const lastPeriod = historicalData[periods - 1];
  
  return [
    {
      period: 'next_month',
      income: lastPeriod.income * 1.05, // 5% growth
      expenses: lastPeriod.expenses * 1.03 // 3% growth
    },
    {
      period: 'next_quarter',
      income: lastPeriod.income * 1.15, // 15% growth
      expenses: lastPeriod.expenses * 1.09 // 9% growth
    }
  ];
}

// Add Advanced Export Features
router.post('/export/template', authenticate, async (req, res) => {
  try {
    const { name, type, config, format } = req.body;
    const user_id = req.user.id;

    await db.run(`
      INSERT INTO report_templates (user_id, name, type, config, format, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'));
    `, [user_id, name, type, JSON.stringify(config), format]);

    res.json({ message: 'Report template created successfully' });
  } catch (error) {
    console.error('Error creating report template:', error);
    throw new APIError(500, 'Failed to create report template', error);
  }
});

router.post('/export/schedule', authenticate, async (req, res) => {
  try {
    const { template_id, schedule, email, format } = req.body;
    const user_id = req.user.id;

    await db.run(`
      INSERT INTO report_schedules (user_id, template_id, schedule, email, format, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'));
    `, [user_id, template_id, schedule, email, format]);

    res.json({ message: 'Report schedule created successfully' });
  } catch (error) {
    console.error('Error creating report schedule:', error);
    throw new APIError(500, 'Failed to create report schedule', error);
  }
});

router.get('/export/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;
    const user_id = req.user.id;

    const template = await db.get(`
      SELECT * FROM report_templates
      WHERE id = ? AND user_id = ?;
    `, [id, user_id]);

    if (!template) {
      throw new APIError(404, 'Report template not found');
    }

    const data = await generateReportData(JSON.parse(template.config));
    const report = await exportReport(data, format);

    res.setHeader('Content-Type', getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename=report.${format}`);
    res.send(report);
  } catch (error) {
    console.error('Error generating report:', error);
    throw new APIError(500, 'Failed to generate report', error);
  }
});

// Helper functions for report generation
async function generateReportData(config) {
  const { type, timeframe, currency, categories } = config;
  
  switch (type) {
    case 'summary':
      return await generateSummaryReport(timeframe, currency);
    case 'detailed':
      return await generateDetailedReport(timeframe, currency, categories);
    case 'custom':
      return await generateCustomReport(config);
    default:
      throw new APIError(400, 'Invalid report type');
  }
}

async function generateSummaryReport(timeframe, currency) {
  return await db.all(`
    WITH RECURSIVE monthly_data AS (
      SELECT 
        strftime('%Y-%m', date) as period,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expenses,
        SUM(amount) as net_flow,
        COUNT(*) as transaction_count,
        currency
      FROM transactions
      WHERE date >= datetime('now', ?)
      ${currency ? 'AND currency = ?' : ''}
      GROUP BY period, currency
    ),
    category_summary AS (
      SELECT 
        c.name as category,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        t.currency
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.date >= datetime('now', ?)
      ${currency ? 'AND t.currency = ?' : ''}
      GROUP BY c.id, t.currency
    )
    SELECT 
      json_object(
        'monthly_data', json_group_array(json_object(
          'period', period,
          'income', income,
          'expenses', expenses,
          'net_flow', net_flow,
          'transaction_count', transaction_count,
          'currency', currency
        )),
        'category_summary', json_group_array(json_object(
          'category', category,
          'total_amount', total_amount,
          'transaction_count', transaction_count,
          'currency', currency
        ))
      ) as report_data
    FROM (
      SELECT * FROM monthly_data
      UNION ALL
      SELECT * FROM category_summary
    );
  `, [`-${timeframe}`, ...(currency ? [currency] : []), `-${timeframe}`, ...(currency ? [currency] : [])]);
}

async function generateDetailedReport(timeframe, currency, categories) {
  return await db.all(`
    SELECT 
      t.date,
      t.description,
      t.amount,
      t.currency,
      c.name as category,
      ba.name as account,
      t.is_recurring,
      t.is_unplanned,
      t.notes
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN bank_accounts ba ON t.account_id = ba.id
    WHERE t.date >= datetime('now', ?)
    ${currency ? 'AND t.currency = ?' : ''}
    ${categories ? 'AND c.id IN (' + categories.join(',') + ')' : ''}
    ORDER BY t.date DESC;
  `, [`-${timeframe}`, ...(currency ? [currency] : [])]);
}

async function generateCustomReport(config) {
  // Custom report generation based on specific configuration
  const { queries, aggregations, filters } = config;
  
  let reportData = {};
  
  for (const query of queries) {
    const data = await db.all(query.sql, query.params);
    reportData[query.name] = data;
  }
  
  for (const aggregation of aggregations) {
    const result = await db.get(aggregation.sql, aggregation.params);
    reportData[aggregation.name] = result;
  }
  
  return reportData;
}

async function exportReport(data, format) {
  switch (format) {
    case 'pdf':
      return await generatePDF(data);
    case 'excel':
      return await generateExcel(data);
    case 'csv':
      return await generateCSV(data);
    default:
      throw new APIError(400, 'Invalid export format');
  }
}

async function generatePDF(data) {
  // PDF generation logic
  // This would use a PDF generation library like pdfkit
  return Buffer.from('PDF content'); // Placeholder
}

async function generateExcel(data) {
  // Excel generation logic
  // This would use a library like exceljs
  return Buffer.from('Excel content'); // Placeholder
}

async function generateCSV(data) {
  // CSV generation logic
  return Buffer.from('CSV content'); // Placeholder
}

function getContentType(format) {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}

// Add Real-time Investment Price Integration
router.get('/investments/prices', authenticate, async (req, res) => {
  try {
    const { types = [], currencies = [] } = req.query;
    const user_id = req.user.id;

    const investments = await db.all(`
      SELECT 
        i.id,
        i.name,
        i.type,
        i.symbol,
        i.amount,
        i.currency,
        i.purchase_date,
        i.current_value,
        i.last_updated
      FROM investments i
      WHERE i.user_id = ?
      ${types.length ? 'AND i.type IN (' + types.map(() => '?').join(',') + ')' : ''}
      ${currencies.length ? 'AND i.currency IN (' + currencies.map(() => '?').join(',') + ')' : ''}
    `, [user_id, ...types, ...currencies]);

    // Update prices in real-time
    const updatedInvestments = await Promise.all(
      investments.map(async (investment) => {
        const currentPrice = await getCurrentPrice(investment);
        if (currentPrice) {
          await updateInvestmentPrice(investment.id, currentPrice);
          investment.current_value = currentPrice * investment.amount;
          investment.last_updated = new Date().toISOString();
        }
        return investment;
      })
    );

    res.json(updatedInvestments);
  } catch (error) {
    console.error('Error getting investment prices:', error);
    throw new APIError(500, 'Failed to get investment prices', error);
  }
});

router.get('/investments/performance', authenticate, async (req, res) => {
  try {
    const { timeframe = '1y', currency } = req.query;
    const user_id = req.user.id;

    const performance = await db.all(`
      WITH RECURSIVE investment_history AS (
        SELECT 
          i.id,
          i.name,
          i.type,
          i.currency,
          i.purchase_date,
          i.amount,
          i.current_value,
          i.last_updated,
          ((i.current_value - i.amount) / i.amount * 100) as return_percentage,
          (i.current_value - i.amount) as return_amount
        FROM investments i
        WHERE i.user_id = ?
        ${currency ? 'AND i.currency = ?' : ''}
      ),
      portfolio_summary AS (
        SELECT 
          type,
          currency,
          SUM(amount) as total_invested,
          SUM(current_value) as current_value,
          SUM(return_amount) as total_return,
          (SUM(current_value) - SUM(amount)) / SUM(amount) * 100 as portfolio_return
        FROM investment_history
        GROUP BY type, currency
      )
      SELECT 
        json_object(
          'individual_performance', json_group_array(json_object(
            'id', id,
            'name', name,
            'type', type,
            'currency', currency,
            'purchase_date', purchase_date,
            'amount', amount,
            'current_value', current_value,
            'return_percentage', return_percentage,
            'return_amount', return_amount,
            'last_updated', last_updated
          )),
          'portfolio_summary', json_group_array(json_object(
            'type', type,
            'currency', currency,
            'total_invested', total_invested,
            'current_value', current_value,
            'total_return', total_return,
            'portfolio_return', portfolio_return
          ))
        ) as performance_data
      FROM (
        SELECT * FROM investment_history
        UNION ALL
        SELECT * FROM portfolio_summary
      );
    `, [user_id, ...(currency ? [currency] : [])]);

    res.json(performance);
  } catch (error) {
    console.error('Error getting investment performance:', error);
    throw new APIError(500, 'Failed to get investment performance', error);
  }
});

// Helper functions for investment price integration
async function getCurrentPrice(investment) {
  try {
    switch (investment.type) {
      case 'stock':
        return await getStockPrice(investment.symbol);
      case 'crypto':
        return await getCryptoPrice(investment.symbol);
      case 'real_estate':
        return await getRealEstateValue(investment.id);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error getting price for ${investment.type}:`, error);
    return null;
  }
}

async function getStockPrice(symbol) {
  // This would integrate with a stock market API
  // For now, return a mock price
  return Math.random() * 100;
}

async function getCryptoPrice(symbol) {
  // This would integrate with a cryptocurrency API
  // For now, return a mock price
  return Math.random() * 1000;
}

async function getRealEstateValue(id) {
  // This would integrate with a real estate valuation service
  // For now, return a mock value
  return Math.random() * 1000000;
}

async function updateInvestmentPrice(id, currentPrice) {
  await db.run(`
    UPDATE investments
    SET current_value = ?,
        last_updated = datetime('now')
    WHERE id = ?;
  `, [currentPrice, id]);
}

// Add multi-currency support tables
const createCurrencyTables = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate DECIMAL(15,6) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT NOT NULL,
        UNIQUE(from_currency, to_currency, timestamp)
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS currency_conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER,
        investment_id INTEGER,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        converted_amount DECIMAL(15,2) NOT NULL,
        rate DECIMAL(15,6) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
      );
    `);
  } catch (error) {
    console.error('Error creating currency tables:', error);
    throw error;
  }
};

// Initialize currency tables
createCurrencyTables();

// Currency helper functions
const fetchExchangeRate = async (fromCurrency, toCurrency) => {
  const axios = require('axios');
  try {
    const response = await axios.get(`${CURRENCY_CONFIG.provider.baseUrl}/convert`, {
      params: {
        from: fromCurrency,
        to: toCurrency,
        amount: 1
      },
      headers: { 'X-API-Key': CURRENCY_CONFIG.provider.apiKey }
    });
    return response.data.rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

const updateExchangeRates = async () => {
  try {
    for (const fromCurrency of CURRENCY_CONFIG.supportedCurrencies) {
      for (const toCurrency of CURRENCY_CONFIG.supportedCurrencies) {
        if (fromCurrency !== toCurrency) {
          try {
            const rate = await fetchExchangeRate(fromCurrency, toCurrency);
            await db.run(`
              INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
              VALUES (?, ?, ?, ?);
            `, [fromCurrency, toCurrency, rate, 'api']);
          } catch (error) {
            console.error(`Error updating rate for ${fromCurrency} to ${toCurrency}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in exchange rate update:', error);
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await db.get(`
      SELECT rate FROM exchange_rates
      WHERE from_currency = ? AND to_currency = ?
      ORDER BY timestamp DESC
      LIMIT 1;
    `, [fromCurrency, toCurrency]);

    if (!rate) {
      throw new Error('Exchange rate not found');
    }

    return amount * rate.rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

// Add currency endpoints
router.get('/currencies/rates', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (from && to) {
      const rate = await db.get(`
        SELECT * FROM exchange_rates
        WHERE from_currency = ? AND to_currency = ?
        ORDER BY timestamp DESC
        LIMIT 1;
      `, [from, to]);

      if (!rate) {
        throw new APIError(404, 'Exchange rate not found');
      }

      res.json(rate);
    } else {
      const rates = await db.all(`
        SELECT from_currency, to_currency, rate, timestamp
        FROM exchange_rates
        WHERE timestamp >= datetime('now', '-1 day')
        ORDER BY timestamp DESC;
      `);

      res.json(rates);
    }
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    throw new APIError(500, 'Failed to get exchange rates', error);
  }
});

router.post('/currencies/convert', authenticate, async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;
    
    if (!amount || !from_currency || !to_currency) {
      throw new APIError(400, 'Missing required parameters');
    }

    const convertedAmount = await convertCurrency(amount, from_currency, to_currency);
    
    await db.run(`
      INSERT INTO currency_conversions (
        user_id, from_currency, to_currency, amount, converted_amount, rate
      ) VALUES (?, ?, ?, ?, ?, ?);
    `, [
      req.user.id,
      from_currency,
      to_currency,
      amount,
      convertedAmount,
      convertedAmount / amount
    ]);

    res.json({
      from_currency,
      to_currency,
      amount,
      converted_amount: convertedAmount,
      rate: convertedAmount / amount
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new APIError(500, 'Failed to convert currency', error);
  }
});

router.get('/currencies/preferences', authenticate, async (req, res) => {
  try {
    const preferences = await db.get(`
      SELECT * FROM currency_preferences
      WHERE user_id = ?;
    `, [req.user.id]);

    if (!preferences) {
      // Create default preferences if none exist
      await db.run(`
        INSERT INTO currency_preferences (user_id, default_currency, display_currencies)
        VALUES (?, ?, ?);
      `, [req.user.id, 'USD', JSON.stringify(['USD', 'EUR', 'GBP'])]);

      const newPreferences = await db.get(`
        SELECT * FROM currency_preferences
        WHERE user_id = ?;
      `, [req.user.id]);

      res.json({
        ...newPreferences,
        display_currencies: JSON.parse(newPreferences.display_currencies)
      });
    } else {
      res.json({
        ...preferences,
        display_currencies: JSON.parse(preferences.display_currencies)
      });
    }
  } catch (error) {
    console.error('Error getting currency preferences:', error);
    throw new APIError(500, 'Failed to get currency preferences', error);
  }
});

router.put('/currencies/preferences', authenticate, async (req, res) => {
  try {
    const { default_currency, display_currencies } = req.body;
    
    if (!default_currency || !display_currencies) {
      throw new APIError(400, 'Missing required parameters');
    }

    await db.run(`
      UPDATE currency_preferences
      SET default_currency = ?,
          display_currencies = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `, [default_currency, JSON.stringify(display_currencies), req.user.id]);

    res.json({
      default_currency,
      display_currencies,
      message: 'Currency preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating currency preferences:', error);
    throw new APIError(500, 'Failed to update currency preferences', error);
  }
});

// Schedule exchange rate updates
setInterval(updateExchangeRates, CURRENCY_CONFIG.updateInterval);

function generateLinearForecast(data) {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((sum, month) => sum + month.income - Math.abs(month.expenses), 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const x = i - xMean;
    const y = data[i].income - Math.abs(data[i].expenses);
    numerator += x * (y - yMean);
    denominator += x * x;
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  return {
    type: 'linear',
    slope,
    intercept,
    forecast: (months) => {
      const predictions = [];
      for (let i = 0; i < months; i++) {
        predictions.push(slope * (n + i) + intercept);
      }
      return predictions;
    }
  };
}

function generateExponentialForecast(data) {
  const n = data.length;
  const logData = data.map(month => Math.log(Math.abs(month.expenses)));
  const xMean = (n - 1) / 2;
  const yMean = logData.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const x = i - xMean;
    const y = logData[i] - yMean;
    numerator += x * y;
    denominator += x * x;
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  return {
    type: 'exponential',
    growth_rate: Math.exp(slope) - 1,
    base: Math.exp(intercept),
    forecast: (months) => {
      const predictions = [];
      for (let i = 0; i < months; i++) {
        predictions.push(Math.exp(slope * (n + i) + intercept));
      }
      return predictions;
    }
  };
}

function generateSeasonalForecast(data) {
  const n = data.length;
  const seasons = 12; // Monthly seasonality
  const seasonalFactors = new Array(seasons).fill(0);
  const seasonalCounts = new Array(seasons).fill(0);
  
  // Calculate seasonal factors
  for (let i = 0; i < n; i++) {
    const season = i % seasons;
    seasonalFactors[season] += data[i].income - Math.abs(data[i].expenses);
    seasonalCounts[season]++;
  }
  
  for (let i = 0; i < seasons; i++) {
    seasonalFactors[i] /= seasonalCounts[i];
  }
  
  // Calculate trend
  const trend = generateLinearForecast(data);
  
  return {
    type: 'seasonal',
    seasonal_factors: seasonalFactors,
    trend,
    forecast: (months) => {
      const predictions = [];
      const trendPredictions = trend.forecast(months);
      
      for (let i = 0; i < months; i++) {
        const season = (n + i) % seasons;
        predictions.push(trendPredictions[i] * seasonalFactors[season]);
      }
      
      return predictions;
    }
  };
}

function generateCategoryForecast(categoryTrends) {
  const categoryModels = {};
  
  categoryTrends.forEach(trend => {
    if (!categoryModels[trend.category]) {
      categoryModels[trend.category] = {
        data: [],
        total: 0,
        count: 0
      };
    }
    
    categoryModels[trend.category].data.push({
      period: trend.period,
      amount: trend.total_amount
    });
    categoryModels[trend.category].total += trend.total_amount;
    categoryModels[trend.category].count++;
  });
  
  Object.keys(categoryModels).forEach(category => {
    const model = categoryModels[category];
    model.average = model.total / model.count;
    model.trend = generateLinearForecast(model.data);
    model.volatility = calculateVolatility(model.data.map(d => d.amount));
  });
  
  return {
    type: 'category',
    models: categoryModels,
    forecast: (months) => {
      const predictions = {};
      Object.keys(categoryModels).forEach(category => {
        predictions[category] = categoryModels[category].trend.forecast(months);
      });
      return predictions;
    }
  };
}

function assessIncomeRisk(data) {
  const volatility = calculateVolatility(data.map(m => m.income));
  const trend = generateLinearForecast(data);
  const recentChange = (data[data.length - 1].income - data[data.length - 2].income) / Math.abs(data[data.length - 2].income) * 100;
  
  return {
    score: calculateRiskScore(volatility, trend.slope, recentChange),
    factors: {
      volatility,
      trend_strength: Math.abs(trend.slope),
      recent_change: recentChange
    },
    level: volatility > 20 ? 'high' : volatility > 10 ? 'medium' : 'low'
  };
}

function assessExpenseRisk(data) {
  const volatility = calculateVolatility(data.map(m => Math.abs(m.expenses)));
  const trend = generateLinearForecast(data);
  const recentChange = (Math.abs(data[data.length - 1].expenses) - Math.abs(data[data.length - 2].expenses)) / 
                      Math.abs(data[data.length - 2].expenses) * 100;
  
  return {
    score: calculateRiskScore(volatility, trend.slope, recentChange),
    factors: {
      volatility,
      trend_strength: Math.abs(trend.slope),
      recent_change: recentChange
    },
    level: volatility > 20 ? 'high' : volatility > 10 ? 'medium' : 'low'
  };
}

function assessSavingsRisk(data) {
  const savings = data.map(m => m.income - Math.abs(m.expenses));
  const volatility = calculateVolatility(savings);
  const trend = generateLinearForecast(data);
  const recentChange = (savings[savings.length - 1] - savings[savings.length - 2]) / 
                      Math.abs(savings[savings.length - 2]) * 100;
  
  return {
    score: calculateRiskScore(volatility, trend.slope, recentChange),
    factors: {
      volatility,
      trend_strength: Math.abs(trend.slope),
      recent_change: recentChange
    },
    level: volatility > 20 ? 'high' : volatility > 10 ? 'medium' : 'low'
  };
}

function assessCategoryRisks(categoryTrends) {
  const risks = {};
  const categoryModels = generateCategoryForecast(categoryTrends).models;
  
  Object.keys(categoryModels).forEach(category => {
    const model = categoryModels[category];
    risks[category] = {
      score: calculateRiskScore(model.volatility, model.trend.slope, 0),
      factors: {
        volatility: model.volatility,
        trend_strength: Math.abs(model.trend.slope),
        average: model.average
      },
      level: model.volatility > 20 ? 'high' : model.volatility > 10 ? 'medium' : 'low'
    };
  });
  
  return risks;
}

function calculateRiskScore(volatility, trend, recentChange) {
  return Math.min(100, Math.max(0, 
    (volatility * 0.4) + 
    (Math.abs(trend) * 30) + 
    (Math.abs(recentChange) * 0.3)
  ));
}

async function getFinancialGoals() {
  const db = await getConnection();
  try {
    const goals = await db.all(`
      SELECT * FROM financial_goals 
      WHERE user_id = ? AND status = 'active'
    `, [req.user.id]);
    return goals;
  } finally {
    db.close();
  }
}

function predictGoalAchievement(goal, forecastModels, riskAssessment) {
  const targetAmount = goal.target_amount;
  const currentAmount = goal.current_amount;
  const monthsRemaining = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30));
  
  const predictions = {
    linear: forecastModels.linear.forecast(monthsRemaining),
    exponential: forecastModels.exponential.forecast(monthsRemaining),
    seasonal: forecastModels.seasonal.forecast(monthsRemaining)
  };
  
  const averagePrediction = predictions.linear.map((_, i) => 
    (predictions.linear[i] + predictions.exponential[i] + predictions.seasonal[i]) / 3
  );
  
  const totalPredicted = averagePrediction.reduce((sum, val) => sum + val, 0);
  const predictedAmount = currentAmount + totalPredicted;
  
  return {
    predicted_amount: predictedAmount,
    confidence: calculateGoalConfidence(predictions, riskAssessment),
    months_remaining: monthsRemaining,
    monthly_required: (targetAmount - currentAmount) / monthsRemaining,
    monthly_predicted: totalPredicted / monthsRemaining,
    status: predictedAmount >= targetAmount ? 'on_track' : 'off_track'
  };
}

function calculateGoalConfidence(predictions, riskAssessment) {
  const variance = calculateVariance([
    ...predictions.linear,
    ...predictions.exponential,
    ...predictions.seasonal
  ]);
  
  const riskScore = (
    riskAssessment.income_risk.score +
    riskAssessment.expense_risk.score +
    riskAssessment.savings_risk.score
  ) / 3;
  
  return Math.max(0, Math.min(100, 100 - (variance * 0.7 + riskScore * 0.3)));
}

function calculateVariance(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}

function generateScenarios(forecastModels, riskAssessment) {
  return {
    optimistic: generateScenario(forecastModels, riskAssessment, 1.2),
    realistic: generateScenario(forecastModels, riskAssessment, 1.0),
    pessimistic: generateScenario(forecastModels, riskAssessment, 0.8)
  };
}

function generateScenario(forecastModels, riskAssessment, factor) {
  const months = 12; // 1 year forecast
  const basePredictions = {
    income: forecastModels.linear.forecast(months),
    expenses: forecastModels.exponential.forecast(months),
    savings: forecastModels.seasonal.forecast(months)
  };
  
  return {
    predictions: {
      income: basePredictions.income.map(v => v * factor),
      expenses: basePredictions.expenses.map(v => v * (2 - factor)), // Inverse relationship
      savings: basePredictions.savings.map((v, i) => 
        basePredictions.income[i] * factor - basePredictions.expenses[i] * (2 - factor)
      )
    },
    risk_factors: {
      income_risk: riskAssessment.income_risk.score * (2 - factor),
      expense_risk: riskAssessment.expense_risk.score * factor,
      savings_risk: riskAssessment.savings_risk.score * factor
    }
  };
}

function generateGoalRecommendations(goal, forecastModels, riskAssessment) {
  const prediction = predictGoalAchievement(goal, forecastModels, riskAssessment);
  const recommendations = [];
  
  if (prediction.status === 'off_track') {
    const shortfall = goal.target_amount - prediction.predicted_amount;
    const monthlyShortfall = shortfall / prediction.months_remaining;
    
    recommendations.push(`Increase monthly savings by ${Math.abs(monthlyShortfall).toFixed(2)} to reach your goal`);
    
    if (riskAssessment.income_risk.level === 'low') {
      recommendations.push('Consider increasing your income to reach the goal faster');
    }
    
    if (riskAssessment.expense_risk.level === 'high') {
      recommendations.push('Review and reduce discretionary spending to free up more funds for your goal');
    }
  } else {
    recommendations.push('You are on track to achieve your goal!');
    
    if (prediction.predicted_amount > goal.target_amount * 1.1) {
      recommendations.push('Consider increasing your goal amount or investing the excess');
    }
  }
  
  return recommendations;
}

function generateOverallRecommendations(forecastModels, riskAssessment, goalPredictions) {
  const recommendations = [];
  
  // Risk-based recommendations
  if (riskAssessment.income_risk.level === 'high') {
    recommendations.push('Consider diversifying your income sources to reduce volatility');
  }
  
  if (riskAssessment.expense_risk.level === 'high') {
    recommendations.push('Create a more detailed budget to better control your expenses');
  }
  
  if (riskAssessment.savings_risk.level === 'high') {
    recommendations.push('Build an emergency fund to protect against income volatility');
  }
  
  // Goal-based recommendations
  const offTrackGoals = goalPredictions.filter(g => g.prediction.status === 'off_track');
  if (offTrackGoals.length > 0) {
    recommendations.push('Prioritize your financial goals and consider adjusting your spending to meet them');
  }
  
  // Forecast-based recommendations
  const incomeTrend = forecastModels.linear.slope;
  const expenseTrend = forecastModels.exponential.growth_rate;
  
  if (incomeTrend < expenseTrend) {
    recommendations.push('Your expenses are growing faster than your income. Consider reviewing your spending habits');
  }
  
  return recommendations;
}

// AI Configuration
const AI_CONFIG = {
  provider: AI_PROVIDER,
  localModel: {
    path: LOCAL_MODEL_PATH,
    options: {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5
    }
  },
  cloudModel: {
    apiKey: CLOUD_API_KEY,
    model: 'gpt-4',
    options: {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5
    }
  }
};

// Initialize AI model based on provider
let aiModel;
if (AI_PROVIDER === 'local') {
  try {
    aiModel = require(LOCAL_MODEL_PATH);
  } catch (error) {
    console.error('Failed to load local AI model:', error);
    throw new Error('Local AI model initialization failed');
  }
} else {
  // Cloud provider will be initialized on first use
  aiModel = null;
}

// Local LLM Integration
const { LocalLLM } = require('@local-llm/financial-advisor');
const localLLM = new LocalLLM(AI_CONFIG.llm.local);

// Cloud LLM Integration
const { CloudLLM } = require('@cloud-llm/financial-advisor');
const cloudLLM = new CloudLLM(AI_CONFIG.llm.cloud);

// Rate Limiting Middleware
const rateLimit = require('express-rate-limit');
const aiLimiter = rateLimit({
  windowMs: AI_CONFIG.rate_limit.window * 1000,
  max: AI_CONFIG.rate_limit.max_requests,
  message: 'Too many requests, please try again later.'
});

// Cache Implementation
const NodeCache = require('node-cache');
const aiCache = new NodeCache({
  stdTTL: AI_CONFIG.cache.ttl,
  maxKeys: AI_CONFIG.cache.max_size
});

// Error Logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-errors.log' }),
    new winston.transports.Console()
  ]
});

// Helper function to get appropriate LLM instance
function getLLM() {
  return AI_CONFIG.llm.provider === 'local' ? localLLM : cloudLLM;
}

// Helper function to sanitize user input
function sanitizeInput(input) {
  return input.replace(/[<>]/g, '').trim();
}

// Helper function to log AI operations
function logAIOperation(operation, data, error = null) {
  logger.info({
    operation,
    timestamp: new Date().toISOString(),
    data: error ? null : data,
    error: error ? error.message : null
  });
}

// Enhanced Investment Analysis
async function analyzeInvestments(investments, forecastModels) {
  try {
    const analysis = {
      performance: [],
      risk: [],
      recommendations: []
    };

    for (const investment of investments) {
      // Calculate performance metrics
      const returns = calculateInvestmentReturns(investment);
      const volatility = calculateVolatility(returns);
      const sharpeRatio = calculateSharpeRatio(returns, 0.02); // Assuming 2% risk-free rate
      
      // Assess risk
      const riskScore = calculateInvestmentRisk(volatility, sharpeRatio);
      
      // Generate recommendations
      const recommendations = generateInvestmentRecommendations(
        investment,
        returns,
        riskScore,
        forecastModels
      );

      analysis.performance.push({
        id: investment.id,
        returns,
        volatility,
        sharpeRatio
      });

      analysis.risk.push({
        id: investment.id,
        score: riskScore,
        factors: {
          volatility,
          marketCorrelation: calculateMarketCorrelation(returns)
        }
      });

      analysis.recommendations.push({
        id: investment.id,
        ...recommendations
      });
    }

    return analysis;
  } catch (error) {
    console.error('Investment analysis failed:', error);
    throw new Error('Failed to analyze investments');
  }
}

// Loan Analysis
async function analyzeLoans(loans, forecastModels) {
  try {
    const analysis = {
      repayment: [],
      risk: [],
      recommendations: []
    };

    for (const loan of loans) {
      // Calculate repayment metrics
      const schedule = calculateRepaymentSchedule(loan);
      const affordability = calculateLoanAffordability(loan, forecastModels);
      
      // Assess risk
      const riskScore = calculateLoanRisk(loan, schedule, affordability);
      
      // Generate recommendations
      const recommendations = generateLoanRecommendations(
        loan,
        schedule,
        riskScore,
        forecastModels
      );

      analysis.repayment.push({
        id: loan.id,
        schedule,
        affordability
      });

      analysis.risk.push({
        id: loan.id,
        score: riskScore,
        factors: {
          debtToIncome: calculateDebtToIncome(loan),
          interestRateRisk: assessInterestRateRisk(loan)
        }
      });

      analysis.recommendations.push({
        id: loan.id,
        ...recommendations
      });
    }

    return analysis;
  } catch (error) {
    console.error('Loan analysis failed:', error);
    throw new Error('Failed to analyze loans');
  }
}

// Insurance Analysis
async function analyzeInsurance(insurances, forecastModels) {
  try {
    const analysis = {
      coverage: [],
      risk: [],
      recommendations: []
    };

    for (const insurance of insurances) {
      // Calculate coverage metrics
      const adequacy = calculateCoverageAdequacy(insurance, forecastModels);
      const gaps = identifyCoverageGaps(insurance, forecastModels);
      
      // Assess risk
      const riskScore = calculateInsuranceRisk(insurance, adequacy, gaps);
      
      // Generate recommendations
      const recommendations = generateInsuranceRecommendations(
        insurance,
        adequacy,
        gaps,
        riskScore,
        forecastModels
      );

      analysis.coverage.push({
        id: insurance.id,
        adequacy,
        gaps
      });

      analysis.risk.push({
        id: insurance.id,
        score: riskScore,
        factors: {
          coverageGaps: gaps.length,
          premiumAffordability: calculatePremiumAffordability(insurance)
        }
      });

      analysis.recommendations.push({
        id: insurance.id,
        ...recommendations
      });
    }

    return analysis;
  } catch (error) {
    console.error('Insurance analysis failed:', error);
    throw new Error('Failed to analyze insurance');
  }
}

// Business Analysis
async function analyzeBusiness(business, forecastModels) {
  try {
    const analysis = {
      financials: [],
      risk: [],
      recommendations: []
    };

    // Calculate financial metrics
    const ratios = calculateFinancialRatios(business.financials);
    const trends = analyzeBusinessTrends(business.financials, forecastModels);
    
    // Assess risk
    const riskScore = calculateBusinessRisk(ratios, trends);
    
    // Generate recommendations
    const recommendations = generateBusinessRecommendations(
      business,
      ratios,
      trends,
      riskScore,
      forecastModels
    );

    analysis.financials.push({
      ratios,
      trends
    });

    analysis.risk.push({
      score: riskScore,
      factors: {
        liquidity: ratios.liquidity,
        profitability: ratios.profitability,
        growth: trends.growth
      }
    });

    analysis.recommendations.push(recommendations);

    return analysis;
  } catch (error) {
    console.error('Business analysis failed:', error);
    throw new Error('Failed to analyze business');
  }
}

// Helper Functions
function calculateInvestmentReturns(investment) {
  // Implementation for calculating investment returns
  return [];
}

function calculateMarketCorrelation(returns) {
  // Implementation for calculating market correlation
  return 0;
}

function calculateLoanAffordability(loan, forecastModels) {
  // Implementation for calculating loan affordability
  return 0;
}

function calculateDebtToIncome(loan) {
  // Implementation for calculating debt-to-income ratio
  return 0;
}

function assessInterestRateRisk(loan) {
  // Implementation for assessing interest rate risk
  return 0;
}

function identifyCoverageGaps(insurance, forecastModels) {
  // Implementation for identifying coverage gaps
  return [];
}

function calculatePremiumAffordability(insurance) {
  // Implementation for calculating premium affordability
  return 0;
}

function calculateFinancialRatios(financials) {
  // Implementation for calculating financial ratios
  return {
    liquidity: 0,
    profitability: 0
  };
}

function analyzeBusinessTrends(financials, forecastModels) {
  // Implementation for analyzing business trends
  return {
    growth: 0
  };
}

// Multi-currency Integration
async function analyzeMultiCurrency(data, baseCurrency) {
  try {
    const analysis = {
      currency_exposure: {
        by_type: {},
        by_category: {},
        total: {}
      },
      exchange_risk: {
        score: 0,
        factors: [],
        recommendations: []
      },
      conversion_impact: {
        historical: [],
        projected: []
      }
    };

    // Analyze currency exposure
    data.forEach(item => {
      const currency = item.currency || baseCurrency;
      
      // Track by type
      if (!analysis.currency_exposure.by_type[item.type]) {
        analysis.currency_exposure.by_type[item.type] = {};
      }
      analysis.currency_exposure.by_type[item.type][currency] = 
        (analysis.currency_exposure.by_type[item.type][currency] || 0) + item.amount;
      
      // Track by category
      if (item.category) {
        if (!analysis.currency_exposure.by_category[item.category]) {
          analysis.currency_exposure.by_category[item.category] = {};
        }
        analysis.currency_exposure.by_category[item.category][currency] = 
          (analysis.currency_exposure.by_category[item.category][currency] || 0) + item.amount;
      }
      
      // Track total
      analysis.currency_exposure.total[currency] = 
        (analysis.currency_exposure.total[currency] || 0) + item.amount;
    });

    // Calculate exchange risk
    analysis.exchange_risk = await calculateExchangeRisk(
      analysis.currency_exposure,
      baseCurrency
    );

    // Calculate conversion impact
    analysis.conversion_impact = await calculateConversionImpact(
      data,
      baseCurrency
    );

    // Log the analysis
    logAIOperation('multi_currency_analysis', analysis);

    return analysis;
  } catch (error) {
    logAIOperation('multi_currency_analysis', null, error);
    throw new APIError(500, 'Failed to analyze multi-currency data', error);
  }
}

// Visualization Data Generation
function generateVisualizationData(analysis) {
  try {
    const visualizations = {
      charts: [],
      tables: [],
      metrics: []
    };

    // Generate portfolio health chart
    if (analysis.portfolio_health) {
      visualizations.charts.push({
        type: 'radar',
        title: 'Portfolio Health',
        data: {
          labels: ['Performance', 'Diversification', 'Risk', 'Growth', 'Stability'],
          datasets: [{
            label: 'Current Score',
            data: [
              analysis.portfolio_health.score,
              analysis.diversification.score,
              100 - analysis.risk_assessment.score,
              analysis.performance.total_return * 100,
              analysis.performance.volatility * 100
            ]
          }]
        }
      });
    }

    // Generate debt health chart
    if (analysis.debt_health) {
      visualizations.charts.push({
        type: 'bar',
        title: 'Debt Analysis',
        data: {
          labels: ['Total Debt', 'Monthly Payments', 'Debt-to-Income'],
          datasets: [{
            label: 'Current Values',
            data: [
              analysis.metrics.total_debt,
              analysis.metrics.monthly_payments,
              analysis.metrics.debt_to_income * 100
            ]
          }]
        }
      });
    }

    // Generate insurance coverage chart
    if (analysis.coverage_health) {
      visualizations.charts.push({
        type: 'pie',
        title: 'Insurance Coverage',
        data: {
          labels: Object.keys(analysis.metrics.by_type),
          datasets: [{
            data: Object.values(analysis.metrics.by_type).map(t => t.total_coverage)
          }]
        }
      });
    }

    // Generate business health metrics
    if (analysis.business_health) {
      visualizations.metrics.push({
        title: 'Business Health',
        metrics: [
          { label: 'Revenue Growth', value: `${(analysis.metrics.revenue_growth * 100).toFixed(1)}%` },
          { label: 'Profit Margin', value: `${(analysis.metrics.profit_margin * 100).toFixed(1)}%` },
          { label: 'Cash Flow', value: analysis.metrics.cash_flow }
        ]
      });
    }

    // Generate currency exposure table
    if (analysis.currency_exposure) {
      visualizations.tables.push({
        title: 'Currency Exposure',
        headers: ['Currency', 'Amount', 'Percentage'],
        rows: Object.entries(analysis.currency_exposure.total).map(([currency, amount]) => {
          const total = Object.values(analysis.currency_exposure.total).reduce((a, b) => a + b, 0);
          return [
            currency,
            amount.toFixed(2),
            `${((amount / total) * 100).toFixed(1)}%`
          ];
        })
      });
    }

    // Log the visualization data
    logAIOperation('visualization_data', visualizations);

    return visualizations;
  } catch (error) {
    logAIOperation('visualization_data', null, error);
    throw new APIError(500, 'Failed to generate visualization data', error);
  }
}

// Helper functions for multi-currency analysis
async function calculateExchangeRisk(exposure, baseCurrency) {
  try {
    const risk = {
      score: 0,
      factors: [],
      recommendations: []
    };

    // Get exchange rates
    const rates = await fetchExchangeRates(baseCurrency);
    
    // Calculate volatility of each currency pair
    const volatilities = {};
    for (const currency in exposure.total) {
      if (currency !== baseCurrency) {
        volatilities[currency] = calculateVolatility(rates[currency]);
      }
    }

    // Calculate weighted risk score
    const totalExposure = Object.values(exposure.total).reduce((a, b) => a + b, 0);
    for (const currency in exposure.total) {
      if (currency !== baseCurrency) {
        const weight = exposure.total[currency] / totalExposure;
        risk.score += weight * volatilities[currency];
      }
    }

    // Generate recommendations based on risk level
    risk.recommendations = generateCurrencyRiskRecommendations(risk.score, exposure);

    return risk;
  } catch (error) {
    throw new APIError(500, 'Failed to calculate exchange risk', error);
  }
}

async function calculateConversionImpact(data, baseCurrency) {
  try {
    const impact = {
      historical: [],
      projected: []
    };

    // Get historical exchange rates
    const historicalRates = await fetchHistoricalExchangeRates(baseCurrency);
    
    // Calculate historical impact
    data.forEach(item => {
      if (item.currency !== baseCurrency) {
        const rate = historicalRates[item.currency];
        impact.historical.push({
          date: item.date,
          original: item.amount,
          converted: item.amount * rate,
          currency: item.currency
        });
      }
    });

    // Project future impact
    const forecastRates = await forecastExchangeRates(baseCurrency);
    impact.projected = forecastRates.map(rate => ({
      date: rate.date,
      currencies: rate.rates
    }));

    return impact;
  } catch (error) {
    throw new APIError(500, 'Failed to calculate conversion impact', error);
  }
}

// AI Model Usage Functions
async function generateAIResponse(prompt, context) {
  try {
    if (AI_PROVIDER === 'local') {
      return await generateLocalResponse(prompt, context);
    } else {
      return await generateCloudResponse(prompt, context);
    }
  } catch (error) {
    console.error('AI response generation failed:', error);
    throw new Error('Failed to generate AI response');
  }
}

async function generateLocalResponse(prompt, context) {
  if (!aiModel) {
    throw new Error('Local AI model not initialized');
  }

  const fullPrompt = `${context}\n\n${prompt}`;
  const response = await aiModel.generate({
    prompt: fullPrompt,
    ...AI_CONFIG.localModel.options
  });

  return response;
}

async function generateCloudResponse(prompt, context) {
  if (!AI_CONFIG.cloudModel.apiKey) {
    throw new Error('Cloud API key not configured');
  }

  const fullPrompt = `${context}\n\n${prompt}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.cloudModel.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.cloudModel.model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      ...AI_CONFIG.cloudModel.options
    })
  });

  if (!response.ok) {
    throw new Error(`Cloud API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = router; 