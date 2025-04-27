const React = window.React;
const { Navigate } = require('react-router-dom');
const { useAuth } = require('../../context/AuthContext');

const AuthRedirect = ({ to = '/', replace = true }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: '/auth/login', replace: true });
  }

  return React.createElement(Navigate, { to, replace });
};

module.exports = { AuthRedirect }; 