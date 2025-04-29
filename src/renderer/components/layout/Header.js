const React = window.React;
const { Link } = require('react-router-dom');
const { useAuth } = require('../../context/AuthContext');

const Header = () => {
  const { user, logout } = useAuth();

  return React.createElement(
    'header',
    { className: 'bg-white shadow' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(
          'div',
          { className: 'flex items-center' },
          React.createElement(
            Link,
            { to: '/', className: 'text-xl font-bold text-gray-900' },
            'Home Budget Manager'
          )
        ),
        React.createElement(
          'div',
          { className: 'flex items-center space-x-4' },
          user && React.createElement(
            'span',
            { className: 'text-sm text-gray-700' },
            `Welcome, ${user.name}`
          ),
          React.createElement(
            'button',
            {
              onClick: logout,
              className: 'text-sm text-indigo-600 hover:text-indigo-900'
            },
            'Logout'
          )
        )
      )
    )
  );
};

module.exports = { Header }; 