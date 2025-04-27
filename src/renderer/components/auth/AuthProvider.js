const React = window.React;
const { AuthContext } = require('../../context/AuthContext');
const { useAuth } = require('../../context/AuthContext');

const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
};

module.exports = { AuthProvider }; 