const React = window.React;
const { Outlet } = require('react-router-dom');

const MainContent = () => {
  return React.createElement(
    'main',
    { className: 'flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6' },
    React.createElement(Outlet, null)
  );
};

module.exports = { MainContent }; 