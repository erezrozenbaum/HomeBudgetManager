import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, message: 'New transaction added', time: '2 minutes ago' },
    { id: 2, message: 'Monthly budget exceeded', time: '1 hour ago' },
    { id: 3, message: 'Investment update available', time: '3 hours ago' }
  ];

  return (
    <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">MyBudgetManager</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <span className="text-gray-600">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="text-gray-600">👤</span>
              <span className="text-gray-800">Profile</span>
            </button>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-4 top-16 w-80 bg-white shadow-lg rounded-lg py-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 