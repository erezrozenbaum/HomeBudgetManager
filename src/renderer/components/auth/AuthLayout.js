const React = window.React;
const { Outlet } = require('react-router-dom');
const { useAuth } = require('../../context/AuthContext');
const { LoadingSpinner } = require('../LoadingSpinner');

const AuthLayout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen' },
      React.createElement(LoadingSpinner)
    );
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8' },
    React.createElement(
      'div',
      { className: 'sm:mx-auto sm:w-full sm:max-w-md' },
      React.createElement(
        'h2',
        { className: 'mt-6 text-center text-3xl font-extrabold text-gray-900' },
        'Home Budget Manager'
      ),
      React.createElement(
        'p',
        { className: 'mt-2 text-center text-sm text-gray-600' },
        'Manage your finances with ease'
      )
    ),
    React.createElement(
      'div',
      { className: 'mt-8 sm:mx-auto sm:w-full sm:max-w-md' },
      React.createElement(
        'div',
        { className: 'bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10' },
        React.createElement(Outlet)
      )
    )
  );
};

module.exports = { AuthLayout }; 