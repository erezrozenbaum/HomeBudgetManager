const React = window.React;
const { LoadingSpinner } = require('../LoadingSpinner');

const AuthLoading = () => {
  return React.createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement(
      'div',
      { className: 'text-center' },
      React.createElement(
        LoadingSpinner,
        { className: 'mx-auto h-12 w-12 text-indigo-600' }
      ),
      React.createElement(
        'h3',
        { className: 'mt-4 text-lg font-medium text-gray-900' },
        'Loading...'
      ),
      React.createElement(
        'p',
        { className: 'mt-2 text-sm text-gray-500' },
        'Please wait while we process your request.'
      )
    )
  );
};

module.exports = { AuthLoading }; 