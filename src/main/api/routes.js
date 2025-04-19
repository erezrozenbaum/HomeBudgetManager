const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Authentication routes
router.post('/auth/register', require('../controllers/auth').register);
router.post('/auth/login', require('../controllers/auth').login);
router.post('/auth/logout', require('../controllers/auth').logout);
router.get('/auth/me', auth, require('../controllers/auth').getProfile);

// Transaction routes
router.get('/transactions', auth, require('../controllers/transactions').getTransactions);
router.post('/transactions', auth, require('../controllers/transactions').createTransaction);
router.put('/transactions/:id', auth, require('../controllers/transactions').updateTransaction);
router.delete('/transactions/:id', auth, require('../controllers/transactions').deleteTransaction);

// Budget routes
router.get('/budgets', auth, require('../controllers/budgets').getBudgets);
router.post('/budgets', auth, require('../controllers/budgets').createBudget);
router.put('/budgets/:id', auth, require('../controllers/budgets').updateBudget);
router.delete('/budgets/:id', auth, require('../controllers/budgets').deleteBudget);

// Goal routes
router.get('/goals', auth, require('../controllers/goals').getGoals);
router.post('/goals', auth, require('../controllers/goals').createGoal);
router.put('/goals/:id', auth, require('../controllers/goals').updateGoal);
router.delete('/goals/:id', auth, require('../controllers/goals').deleteGoal);

// Debt routes
router.get('/debts', auth, require('../controllers/debts').getDebts);
router.post('/debts', auth, require('../controllers/debts').createDebt);
router.put('/debts/:id', auth, require('../controllers/debts').updateDebt);
router.delete('/debts/:id', auth, require('../controllers/debts').deleteDebt);
router.post('/debts/:id/payments', auth, require('../controllers/debts').addPayment);

// Notification routes
router.get('/notifications', auth, require('../controllers/notifications').getNotifications);
router.post('/notifications', auth, require('../controllers/notifications').createNotification);
router.put('/notifications/:id', auth, require('../controllers/notifications').updateNotification);
router.delete('/notifications/:id', auth, require('../controllers/notifications').deleteNotification);
router.get('/notifications/settings', auth, require('../controllers/notifications').getSettings);
router.put('/notifications/settings', auth, require('../controllers/notifications').updateSettings);

// Bill routes
router.get('/bills', auth, require('../controllers/bills').getBills);
router.post('/bills', auth, require('../controllers/bills').createBill);
router.put('/bills/:id', auth, require('../controllers/bills').updateBill);
router.delete('/bills/:id', auth, require('../controllers/bills').deleteBill);
router.post('/bills/:id/pay', auth, require('../controllers/bills').markAsPaid);

// Net Worth routes
router.get('/assets', auth, require('../controllers/netWorth').getAssets);
router.post('/assets', auth, require('../controllers/netWorth').createAsset);
router.put('/assets/:id', auth, require('../controllers/netWorth').updateAsset);
router.delete('/assets/:id', auth, require('../controllers/netWorth').deleteAsset);
router.get('/liabilities', auth, require('../controllers/netWorth').getLiabilities);
router.post('/liabilities', auth, require('../controllers/netWorth').createLiability);
router.put('/liabilities/:id', auth, require('../controllers/netWorth').updateLiability);
router.delete('/liabilities/:id', auth, require('../controllers/netWorth').deleteLiability);
router.get('/net-worth/history', auth, require('../controllers/netWorth').getHistory);

// Tax Planning routes
router.get('/tax/income', auth, require('../controllers/tax').getIncome);
router.post('/tax/income', auth, require('../controllers/tax').createIncome);
router.put('/tax/income/:id', auth, require('../controllers/tax').updateIncome);
router.delete('/tax/income/:id', auth, require('../controllers/tax').deleteIncome);
router.get('/tax/deductions', auth, require('../controllers/tax').getDeductions);
router.post('/tax/deductions', auth, require('../controllers/tax').createDeduction);
router.put('/tax/deductions/:id', auth, require('../controllers/tax').updateDeduction);
router.delete('/tax/deductions/:id', auth, require('../controllers/tax').deleteDeduction);
router.get('/tax/brackets', auth, require('../controllers/tax').getBrackets);

// Financial Calendar routes
router.get('/calendar/events', auth, require('../controllers/calendar').getEvents);
router.post('/calendar/events', auth, require('../controllers/calendar').createEvent);
router.put('/calendar/events/:id', auth, require('../controllers/calendar').updateEvent);
router.delete('/calendar/events/:id', auth, require('../controllers/calendar').deleteEvent);

// Import/Export routes
router.post('/import', auth, require('../controllers/importExport').importData);
router.get('/export', auth, require('../controllers/importExport').exportData);

// User Profile routes
router.get('/users/profile', auth, require('../controllers/users').getProfile);
router.put('/users/profile', auth, require('../controllers/users').updateProfile);
router.put('/users/password', auth, require('../controllers/users').changePassword);
router.delete('/users', auth, require('../controllers/users').deleteAccount);

// Help & Support routes
router.get('/help/faqs', auth, require('../controllers/help').getFaqs);
router.get('/help/tickets', auth, require('../controllers/help').getTickets);
router.post('/help/tickets', auth, require('../controllers/help').createTicket);
router.put('/help/tickets/:id', auth, require('../controllers/help').updateTicket);

module.exports = router; 