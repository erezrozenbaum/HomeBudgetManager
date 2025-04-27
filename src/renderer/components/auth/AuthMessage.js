const React = window.React;
const { Link } = require('react-router-dom');

const AuthMessage = ({ type, message, linkText, linkTo }) => {
  const getMessageStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      case 'info':
        return 'bg-blue-50 text-blue-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return React.createElement(
    'div',
    {
      className: `p-4 rounded-md ${getMessageStyles()}`
    },
    React.createElement(
      'div',
      { className: 'flex items-center' },
      React.createElement(
        'div',
        { className: 'flex-shrink-0' },
        type === 'success' && React.createElement(
          'svg',
          {
            className: 'h-5 w-5 text-green-400',
            viewBox: '0 0 20 20',
            fill: 'currentColor'
          },
          React.createElement('path', {
            fillRule: 'evenodd',
            d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
            clipRule: 'evenodd'
          })
        ),
        type === 'error' && React.createElement(
          'svg',
          {
            className: 'h-5 w-5 text-red-400',
            viewBox: '0 0 20 20',
            fill: 'currentColor'
          },
          React.createElement('path', {
            fillRule: 'evenodd',
            d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
            clipRule: 'evenodd'
          })
        ),
        type === 'info' && React.createElement(
          'svg',
          {
            className: 'h-5 w-5 text-blue-400',
            viewBox: '0 0 20 20',
            fill: 'currentColor'
          },
          React.createElement('path', {
            fillRule: 'evenodd',
            d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
            clipRule: 'evenodd'
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'ml-3' },
        React.createElement(
          'p',
          { className: 'text-sm font-medium' },
          message
        )
      )
    ),
    linkText && linkTo && React.createElement(
      'div',
      { className: 'mt-3' },
      React.createElement(
        Link,
        {
          to: linkTo,
          className: 'text-sm font-medium underline'
        },
        linkText
      )
    )
  );
};

module.exports = { AuthMessage }; 