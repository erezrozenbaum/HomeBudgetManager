const React = window.React;
const { createRoot } = require('react-dom/client');
const { BrowserRouter } = require('react-router-dom');
const { AuthProvider } = require('./context/AuthContext');
const { ThemeProvider } = require('./context/ThemeContext');
const { App } = require('./App');
require('./index.css');

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(App)
      )
    )
  )
); 