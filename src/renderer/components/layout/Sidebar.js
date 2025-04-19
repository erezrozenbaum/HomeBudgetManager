import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💰' },
    { path: '/accounts', label: 'Accounts', icon: '🏦' },
    { 
      path: '/investments', 
      label: 'Investments', 
      icon: '📈',
      subItems: [
        { path: '/investments/stocks', label: 'Stocks', icon: '📊' },
        { path: '/investments/crypto', label: 'Crypto', icon: '₿' },
        { path: '/investments/real-estate', label: 'Real Estate', icon: '🏠' }
      ]
    },
    { path: '/reports', label: 'Reports', icon: '📑' },
    { path: '/ai-advisor', label: 'AI Advisor', icon: '🤖' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">MyBudgetManager</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-700 rounded"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center p-4 hover:bg-gray-700 ${
                location.pathname === item.path ? 'bg-gray-700' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
            {!isCollapsed && item.subItems && (
              <div className="ml-8">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      location.pathname === subItem.path ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-xl mr-3">{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 