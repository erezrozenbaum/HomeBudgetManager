const React = window.React;
const { Card } = require('../Card');

const AuthCard = ({ title, children }) => {
  return React.createElement(
    Card,
    {
      className: 'bg-white shadow sm:rounded-lg'
    },
    title && React.createElement(
      'div',
      { className: 'px-4 py-5 sm:px-6' },
      React.createElement(
        'h3',
        { className: 'text-lg font-medium leading-6 text-gray-900' },
        title
      )
    ),
    React.createElement(
      'div',
      { className: 'px-4 py-5 sm:p-6' },
      children
    )
  );
};

module.exports = { AuthCard }; 