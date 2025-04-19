import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const MainContent = ({ children }) => {
  const { isAuthenticated, isPasswordProtected } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            MyBudgetManager
          </h2>
          <div className="flex items-center space-x-4">
            {isPasswordProtected && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? '🔓 Unlocked' : '🔒 Locked'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} MyBudgetManager - All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}; 