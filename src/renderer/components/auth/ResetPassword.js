const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const success = await updatePassword(newPassword);
      if (success) {
        setSuccess('Password has been reset successfully');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Reset Password',
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
          label: 'Confirm New Password',
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
          className: 'w-full',
          disabled: isLoading
        },
        isLoading ? 'Resetting...' : 'Reset Password'
      ),
      success && React.createElement(
        'div',
        { className: 'text-green-500 text-sm' },
        success
      )
    )
  );
};

module.exports = { ResetPassword }; 