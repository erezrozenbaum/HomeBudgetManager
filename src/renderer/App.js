'use strict';

const React = window.React;
const { Routes, Route } = require('react-router-dom');
const { useAuth } = require('./context/AuthContext');
const { useTheme } = require('./context/ThemeContext');
const { useTimezone } = require('./context/TimezoneContext');
const { useSecurity } = require('./context/SecurityContext');

// Import components
const { MainLayout } = require('./components/layout/MainLayout');
const { Login } = require('./components/auth/Login');
const { PasswordSetup } = require('./components/auth/PasswordSetup');
const { SecuritySettings } = require('./components/auth/SecuritySettings');
const { ProtectedRoute } = require('./components/auth/ProtectedRoute');

// Import pages
const { Dashboard } = require('./pages/Dashboard');
const { BankAccounts } = require('./pages/BankAccounts');
const { CreditCards } = require('./pages/CreditCards');
const { Transactions } = require('./pages/Transactions');
const { Investments } = require('./pages/Investments');
const { Goals } = require('./pages/Goals');
const { Loans } = require('./pages/Loans');
const { Insurances } = require('./pages/Insurances');
const { Businesses } = require('./pages/Businesses');
const { AIAdvisor } = require('./pages/AIAdvisor');
const { Settings } = require('./pages/Settings');

const App = () => {
    const { isAuthenticated, isPasswordProtected } = useAuth();
    const { theme } = useTheme();
    const { timezone } = useTimezone();
    const { isSecurityEnabled } = useSecurity();

    return React.createElement(
        'div',
        { className: `app ${theme}-theme` },
        React.createElement(
            Routes,
            null,
            React.createElement(Route, {
                path: '/login',
                element: React.createElement(Login)
            }),
            React.createElement(Route, {
                path: '/password-setup',
                element: React.createElement(PasswordSetup)
            }),
            React.createElement(Route, {
                path: '/security-settings',
                element: React.createElement(SecuritySettings)
            }),
            React.createElement(Route, {
                element: React.createElement(ProtectedRoute, { isAuthenticated, isPasswordProtected }),
                children: [
                    React.createElement(Route, {
                        element: React.createElement(MainLayout),
                        children: [
                            React.createElement(Route, {
                                path: '/',
                                element: React.createElement(Dashboard)
                            }),
                            React.createElement(Route, {
                                path: '/bank-accounts',
                                element: React.createElement(BankAccounts)
                            }),
                            React.createElement(Route, {
                                path: '/credit-cards',
                                element: React.createElement(CreditCards)
                            }),
                            React.createElement(Route, {
                                path: '/transactions',
                                element: React.createElement(Transactions)
                            }),
                            React.createElement(Route, {
                                path: '/investments',
                                element: React.createElement(Investments)
                            }),
                            React.createElement(Route, {
                                path: '/goals',
                                element: React.createElement(Goals)
                            }),
                            React.createElement(Route, {
                                path: '/loans',
                                element: React.createElement(Loans)
                            }),
                            React.createElement(Route, {
                                path: '/insurances',
                                element: React.createElement(Insurances)
                            }),
                            React.createElement(Route, {
                                path: '/businesses',
                                element: React.createElement(Businesses)
                            }),
                            React.createElement(Route, {
                                path: '/ai-advisor',
                                element: React.createElement(AIAdvisor)
                            }),
                            React.createElement(Route, {
                                path: '/settings',
                                element: React.createElement(Settings)
                            })
                        ]
                    })
                ]
            })
        )
    );
};

module.exports = { App }; 