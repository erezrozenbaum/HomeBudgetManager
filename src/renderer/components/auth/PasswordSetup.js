const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const PasswordSetup = () => {
  const { setPassword } = useAuth();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const success = await setPassword(newPassword);
      if (!success) {
        setError('Failed to set password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Set Password',
      className: 'max-w-md mx-auto mt-8'
    },
    React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        className: 'space-y-4'
      },
      React.createElement(
        FormInput,
        {
          label: 'New Password',
          name: 'newPassword',
          type: 'password',
          value: newPassword,
          onChange: (e) => setNewPassword(e.target.value),
          required: true
        }
      ),
      React.createElement(
        FormInput,
        {
          label: 'Confirm Password',
          name: 'confirmPassword',
          type: 'password',
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          error,
          required: true
        }
      ),
      React.createElement(
        Button,
        {
          type: 'submit',
          className: 'w-full'
        },
        'Set Password'
      )
    )
  );
};

module.exports = { PasswordSetup }; 