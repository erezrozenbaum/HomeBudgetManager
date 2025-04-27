const React = window.React;
const { Link } = require('react-router-dom');

const AuthLink = ({ to, children, className = '' }) => {
  return React.createElement(
    Link,
    {
      to,
      className: `text-sm font-medium text-indigo-600 hover:text-indigo-500 ${className}`
    },
    children
  );
};

module.exports = { AuthLink }; 