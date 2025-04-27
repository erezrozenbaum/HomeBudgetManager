const React = window.React;
const { Routes, Route, Navigate } = require('react-router-dom');
const { useAuth } = require('../../context/AuthContext');
const { AuthLayout } = require('./AuthLayout');
const { Login } = require('./Login');
const { PasswordSetup } = require('./PasswordSetup');
const { ForgotPassword } = require('./ForgotPassword');
const { ResetPassword } = require('./ResetPassword');

const AuthRoutes = () => {
  const { isAuthenticated, isPasswordProtected } = useAuth();

  if (isAuthenticated) {
    return React.createElement(Navigate, { to: '/', replace: true });
  }

  return React.createElement(
    Routes,
    null,
    React.createElement(
      Route,
      { element: React.createElement(AuthLayout) },
      React.createElement(
        Route,
        { path: 'login', element: React.createElement(Login) }
      ),
      React.createElement(
        Route,
        { path: 'setup', element: React.createElement(PasswordSetup) }
      ),
      React.createElement(
        Route,
        { path: 'forgot-password', element: React.createElement(ForgotPassword) }
      ),
      React.createElement(
        Route,
        { path: 'reset-password', element: React.createElement(ResetPassword) }
      ),
      React.createElement(
        Route,
        { path: '*', element: React.createElement(Navigate, { to: '/auth/login', replace: true }) }
      )
    )
  );
};

module.exports = { AuthRoutes }; 