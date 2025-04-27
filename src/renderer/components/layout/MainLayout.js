const React = window.React;
const { Outlet } = require('react-router-dom');
const { Header } = require('./Header');
const { Sidebar } = require('./Sidebar');

const MainLayout = () => {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-100' },
    React.createElement(Header, null),
    React.createElement(
      'div',
      { className: 'flex' },
      React.createElement(Sidebar, null),
      React.createElement(
        'main',
        { className: 'flex-1 p-6' },
        React.createElement(Outlet, null)
      )
    )
  );
};

module.exports = { MainLayout }; 