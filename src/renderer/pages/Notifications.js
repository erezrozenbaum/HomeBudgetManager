import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    budgetAlerts: true,
    billReminders: true,
    lowBalance: true,
    unusualSpending: true,
    investmentUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    budgetThreshold: 80,
    lowBalanceThreshold: 100,
    unusualSpendingThreshold: 200
  });
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    fetchNotifications();
    fetchAlertSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchAlertSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      const data = await response.json();
      setAlertSettings(data);
    } catch (error) {
      console.error('Error fetching alert settings:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertSettings),
      });
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error updating alert settings:', error);
    }
  };

  const getNotificationChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString();
    }).reverse();

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Notifications',
          data: last7Days.map(date => 
            notifications.filter(n => new Date(n.date).toLocaleDateString() === date).length
          ),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications & Alerts</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded ${
              activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${
              activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Alert Settings
          </button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Activity</h2>
            <div className="h-64">
              <Line data={getNotificationChartData()} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Notifications</h2>
            </div>
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex justify-between items-center ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Alert Settings</h2>
          <form onSubmit={handleUpdateSettings}>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-3">Notification Types</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.budgetAlerts}
                      onChange={(e) => setAlertSettings({ ...alertSettings, budgetAlerts: e.target.checked })}
                      className="mr-2"
                    />
                    Budget Limit Alerts
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.billReminders}
                      onChange={(e) => setAlertSettings({ ...alertSettings, billReminders: e.target.checked })}
                      className="mr-2"
                    />
                    Bill Payment Reminders
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.lowBalance}
                      onChange={(e) => setAlertSettings({ ...alertSettings, lowBalance: e.target.checked })}
                      className="mr-2"
                    />
                    Low Balance Alerts
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.unusualSpending}
                      onChange={(e) => setAlertSettings({ ...alertSettings, unusualSpending: e.target.checked })}
                      className="mr-2"
                    />
                    Unusual Spending Alerts
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.investmentUpdates}
                      onChange={(e) => setAlertSettings({ ...alertSettings, investmentUpdates: e.target.checked })}
                      className="mr-2"
                    />
                    Investment Updates
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-3">Notification Methods</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.emailNotifications}
                      onChange={(e) => setAlertSettings({ ...alertSettings, emailNotifications: e.target.checked })}
                      className="mr-2"
                    />
                    Email Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.pushNotifications}
                      onChange={(e) => setAlertSettings({ ...alertSettings, pushNotifications: e.target.checked })}
                      className="mr-2"
                    />
                    Push Notifications
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-3">Alert Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Budget Usage Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={alertSettings.budgetThreshold}
                      onChange={(e) => setAlertSettings({ ...alertSettings, budgetThreshold: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Low Balance Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={alertSettings.lowBalanceThreshold}
                      onChange={(e) => setAlertSettings({ ...alertSettings, lowBalanceThreshold: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unusual Spending Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={alertSettings.unusualSpendingThreshold}
                      onChange={(e) => setAlertSettings({ ...alertSettings, unusualSpendingThreshold: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Notifications; 