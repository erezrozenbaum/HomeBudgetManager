import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Bank Accounts', path: '/bank-accounts', icon: '🏦' },
  { name: 'Credit Cards', path: '/credit-cards', icon: '💳' },
  { name: 'Transactions', path: '/transactions', icon: '💰' },
  { name: 'Investments', path: '/investments', icon: '📈' },
  { name: 'Saving Goals', path: '/saving-goals', icon: '🎯' },
  { name: 'Loans', path: '/loans', icon: '🏠' },
  { name: 'Insurances', path: '/insurances', icon: '🛡️' },
  { name: 'Businesses', path: '/businesses', icon: '🏢' },
  { name: 'AI Advisor', path: '/ai-advisor', icon: '🤖' },
  { name: 'Settings', path: '/settings', icon: '⚙️' }
];

export const Sidebar = () => {
  const { isAuthenticated, isPasswordProtected } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
      {/* Logo and App Name */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          MyBudgetManager
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
        >
          {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>

        {/* Security Status */}
        {isPasswordProtected && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              Password Protected
            </div>
            {isAuthenticated && (
              <div className="flex items-center mt-1">
                <span className="mr-2">✅</span>
                Authenticated
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 