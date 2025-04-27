const React = window.React;

const Card = ({ children, className = '', title, footer, ...props }) => {
  return React.createElement(
    'div',
    {
      className: `bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`,
      ...props
    },
    title && React.createElement(
      'div',
      { className: 'px-4 py-5 border-b border-gray-200 dark:border-gray-700' },
      React.createElement(
        'h3',
        { className: 'text-lg font-medium text-gray-900 dark:text-white' },
        title
      )
    ),
    React.createElement(
      'div',
      { className: 'p-4' },
      children
    ),
    footer && React.createElement(
      'div',
      { className: 'px-4 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700' },
      footer
    )
  );
};

module.exports = { Card }; 