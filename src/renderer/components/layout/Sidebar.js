const React = window.React;
const { Link, useLocation } = require('react-router-dom');

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Transactions', href: '/transactions', icon: '💸' },
    { name: 'Budgets', href: '/budgets', icon: '💰' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Settings', href: '/settings', icon: '⚙️' }
  ];

  return React.createElement(
    'div',
    { className: 'bg-gray-800 w-64 min-h-screen' },
    React.createElement(
      'div',
      { className: 'flex flex-col h-full' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-center h-16 bg-gray-900' },
        React.createElement(
          'span',
          { className: 'text-white text-xl font-bold' },
          'Menu'
        )
      ),
      React.createElement(
        'nav',
        { className: 'flex-1 px-2 py-4 space-y-1' },
        navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return React.createElement(
            Link,
            {
              key: item.name,
              to: item.href,
              className: `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            },
            React.createElement(
              'span',
              { className: 'mr-3' },
              item.icon
            ),
            item.name
          );
        })
      )
    )
  );
};

module.exports = { Sidebar }; 