const React = window.React;

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return React.createElement(
    'div',
    {
      className: `flex items-center justify-center ${className}`
    },
    React.createElement(
      'div',
      {
        className: `
          ${sizes[size]}
          border-4 border-gray-200 dark:border-gray-700
          border-t-blue-500 dark:border-t-blue-400
          rounded-full animate-spin
        `
      }
    )
  );
};

module.exports = { LoadingSpinner }; 