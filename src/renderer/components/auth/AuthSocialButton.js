const React = window.React;
const { Button } = require('../Button');

const AuthSocialButton = ({ provider, icon, onClick, className = '' }) => {
  const getProviderStyles = () => {
    switch (provider) {
      case 'google':
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
      case 'facebook':
        return 'bg-[#1877F2] text-white hover:bg-[#166FE5]';
      case 'github':
        return 'bg-gray-800 text-white hover:bg-gray-700';
      default:
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
    }
  };

  return React.createElement(
    Button,
    {
      onClick,
      className: `w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getProviderStyles()} ${className}`,
      type: 'button'
    },
    React.createElement(
      'span',
      { className: 'w-5 h-5' },
      icon
    ),
    React.createElement(
      'span',
      null,
      `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
    )
  );
};

module.exports = { AuthSocialButton }; 