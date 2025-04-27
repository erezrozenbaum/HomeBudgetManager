const React = window.React;
const { Link } = require('react-router-dom');

const AuthHeader = () => {
  return React.createElement(
    'div',
    { className: 'text-center mb-8' },
    React.createElement(
      Link,
      {
        to: '/',
        className: 'inline-block'
      },
      React.createElement(
        'h1',
        { className: 'text-4xl font-bold text-gray-900' },
        'Home Budget Manager'
      )
    ),
    React.createElement(
      'p',
      { className: 'mt-2 text-sm text-gray-600' },
      'Manage your finances with ease'
    )
  );
};

module.exports = { AuthHeader }; 