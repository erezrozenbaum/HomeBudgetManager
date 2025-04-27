const React = window.React;
const { useState, useEffect } = React;
const { Line } = require('react-chartjs-2');
const {
  Chart: ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} = require('chart.js');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Notifications() {
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

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Notifications & Alerts'),
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('button', {
          onClick: () => setActiveTab('notifications'),
          className: `px-4 py-2 rounded ${
            activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`
        }, 'Notifications'),
        React.createElement('button', {
          onClick: () => setActiveTab('settings'),
          className: `px-4 py-2 rounded ${
            activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`
        }, 'Alert Settings')
      )
    ),
    activeTab === 'notifications' ? React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Notification Activity'),
        React.createElement('div', { className: 'h-64' },
          React.createElement(Line, { data: getNotificationChartData() })
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow' },
        React.createElement('div', { className: 'p-4 border-b' },
          React.createElement('h2', { className: 'text-lg font-semibold' }, 'Recent Notifications')
        ),
        React.createElement('div', { className: 'divide-y' },
          notifications.map((notification) =>
            React.createElement('div', {
              key: notification.id,
              className: `p-4 flex justify-between items-center ${
                !notification.read ? 'bg-blue-50' : ''
              }`
            },
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-medium' }, notification.title),
                React.createElement('p', { className: 'text-sm text-gray-500' }, notification.message),
                React.createElement('p', { className: 'text-xs text-gray-400' },
                  new Date(notification.date).toLocaleString()
                )
              ),
              React.createElement('div', { className: 'flex space-x-2' },
                !notification.read && React.createElement('button', {
                  onClick: () => handleMarkAsRead(notification.id),
                  className: 'text-blue-600 hover:text-blue-800'
                }, 'Mark as Read'),
                React.createElement('button', {
                  onClick: () => handleDeleteNotification(notification.id),
                  className: 'text-red-600 hover:text-red-800'
                }, 'Delete')
              )
            )
          )
        )
      )
    ) : React.createElement('div', { className: 'bg-white rounded-lg shadow' },
      React.createElement('div', { className: 'p-4 border-b' },
        React.createElement('h2', { className: 'text-lg font-semibold' }, 'Alert Settings')
      ),
      React.createElement('form', {
        onSubmit: handleUpdateSettings,
        className: 'p-4 space-y-4'
      },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium mb-2' }, 'Alert Types'),
            React.createElement('div', { className: 'space-y-2' },
              Object.entries({
                budgetAlerts: 'Budget Alerts',
                billReminders: 'Bill Reminders',
                lowBalance: 'Low Balance',
                unusualSpending: 'Unusual Spending',
                investmentUpdates: 'Investment Updates'
              }).map(([key, label]) =>
                React.createElement('div', {
                  key,
                  className: 'flex items-center'
                },
                  React.createElement('input', {
                    type: 'checkbox',
                    id: key,
                    checked: alertSettings[key],
                    onChange: (e) => setAlertSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    })),
                    className: 'h-4 w-4 text-blue-600'
                  }),
                  React.createElement('label', {
                    htmlFor: key,
                    className: 'ml-2'
                  }, label)
                )
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium mb-2' }, 'Notification Methods'),
            React.createElement('div', { className: 'space-y-2' },
              Object.entries({
                emailNotifications: 'Email Notifications',
                pushNotifications: 'Push Notifications'
              }).map(([key, label]) =>
                React.createElement('div', {
                  key,
                  className: 'flex items-center'
                },
                  React.createElement('input', {
                    type: 'checkbox',
                    id: key,
                    checked: alertSettings[key],
                    onChange: (e) => setAlertSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    })),
                    className: 'h-4 w-4 text-blue-600'
                  }),
                  React.createElement('label', {
                    htmlFor: key,
                    className: 'ml-2'
                  }, label)
                )
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium mb-2' }, 'Thresholds'),
            React.createElement('div', { className: 'space-y-4' },
              Object.entries({
                budgetThreshold: 'Budget Alert Threshold (%)',
                lowBalanceThreshold: 'Low Balance Threshold ($)',
                unusualSpendingThreshold: 'Unusual Spending Threshold ($)'
              }).map(([key, label]) =>
                React.createElement('div', {
                  key,
                  className: 'flex flex-col'
                },
                  React.createElement('label', {
                    htmlFor: key,
                    className: 'mb-1'
                  }, label),
                  React.createElement('input', {
                    type: 'number',
                    id: key,
                    value: alertSettings[key],
                    onChange: (e) => setAlertSettings(prev => ({
                      ...prev,
                      [key]: Number(e.target.value)
                    })),
                    className: 'border rounded px-3 py-2'
                  })
                )
              )
            )
          )
        ),
        React.createElement('div', { className: 'flex justify-end' },
          React.createElement('button', {
            type: 'submit',
            className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
          }, 'Save Settings')
        )
      )
    )
  );
}

module.exports = { Notifications }; 