const React = window.React;
const { FormInput } = require('../FormInput');
const { Button } = require('../Button');

const AuthForm = ({ title, onSubmit, children, isLoading, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return React.createElement(
    'form',
    {
      onSubmit: handleSubmit,
      className: 'space-y-6'
    },
    React.createElement(
      'div',
      { className: 'space-y-4' },
      children
    ),
    error && React.createElement(
      'div',
      { className: 'text-red-500 text-sm' },
      error
    ),
    React.createElement(
      Button,
      {
        type: 'submit',
        className: 'w-full',
        disabled: isLoading
      },
      isLoading ? 'Loading...' : title
    )
  );
};

module.exports = { AuthForm }; 