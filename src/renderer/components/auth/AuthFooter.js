const React = window.React;
const { Link } = require('react-router-dom');

const AuthFooter = () => {
  return React.createElement(
    'div',
    { className: 'mt-8 text-center text-sm text-gray-600' },
    React.createElement(
      'p',
      null,
      'Need help? ',
      React.createElement(
        Link,
        {
          to: '/contact',
          className: 'font-medium text-indigo-600 hover:text-indigo-500'
        },
        'Contact support'
      )
    ),
    React.createElement(
      'p',
      { className: 'mt-2' },
      '© ',
      new Date().getFullYear(),
      ' Home Budget Manager. All rights reserved.'
    )
  );
};

module.exports = { AuthFooter }; 