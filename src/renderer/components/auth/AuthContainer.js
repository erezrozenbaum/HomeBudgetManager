const React = window.React;
const { AuthHeader } = require('./AuthHeader');
const { AuthFooter } = require('./AuthFooter');

const AuthContainer = ({ children }) => {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 flex flex-col' },
    React.createElement(
      'div',
      { className: 'flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8' },
      React.createElement(
        'div',
        { className: 'w-full max-w-md space-y-8' },
        React.createElement(AuthHeader),
        children
      )
    ),
    React.createElement(AuthFooter)
  );
};

module.exports = { AuthContainer }; 