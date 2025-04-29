const React = window.React;
const { Navigate, Outlet } = require('react-router-dom');
const { useAuth } = require('../../context/AuthContext');
const { LoadingSpinner } = require('../LoadingSpinner');

const ProtectedRoute = ({ isAuthenticated, isPasswordProtected }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen' },
      React.createElement(LoadingSpinner)
    );
  }

  if (isPasswordProtected && !isAuthenticated) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  return React.createElement(Outlet);
};

module.exports = { ProtectedRoute }; 