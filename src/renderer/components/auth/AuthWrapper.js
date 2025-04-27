const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { AuthLoading } = require('./AuthLoading');
const { AuthErrorBoundary } = require('./AuthErrorBoundary');
const { AuthProvider } = require('./AuthProvider');

const AuthWrapper = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return React.createElement(AuthLoading);
  }

  return React.createElement(
    AuthErrorBoundary,
    null,
    React.createElement(
      AuthProvider,
      null,
      children
    )
  );
};

module.exports = { AuthWrapper }; 