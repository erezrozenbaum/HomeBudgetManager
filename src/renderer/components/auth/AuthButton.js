const React = window.React;
const { Button } = require('../Button');

const AuthButton = ({ children, type = 'button', variant = 'primary', className = '', disabled = false, onClick }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    }
  };

  return React.createElement(
    Button,
    {
      type,
      className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantStyles()} ${className}`,
      disabled,
      onClick
    },
    children
  );
};

module.exports = { AuthButton }; 