const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const SecuritySettings = () => {
  const { isPasswordProtected, removePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleRemovePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const success = await removePassword(currentPassword);
      if (success) {
        setSuccess('Password protection has been removed');
        setCurrentPassword('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Security Settings',
      className: 'max-w-md mx-auto mt-8'
    },
    React.createElement(
      'div',
      { className: 'space-y-4' },
      isPasswordProtected && React.createElement(
        'form',
        {
          onSubmit: handleRemovePassword,
          className: 'space-y-4'
        },
        React.createElement(
          FormInput,
          {
            label: 'Current Password',
            name: 'currentPassword',
            type: 'password',
            value: currentPassword,
            onChange: (e) => setCurrentPassword(e.target.value),
            error,
            required: true
          }
        ),
        React.createElement(
          Button,
          {
            type: 'submit',
            variant: 'danger',
            className: 'w-full'
          },
          'Remove Password Protection'
        )
      ),
      success && React.createElement(
        'div',
        { className: 'text-green-500 text-sm' },
        success
      )
    )
  );
};

module.exports = { SecuritySettings }; 