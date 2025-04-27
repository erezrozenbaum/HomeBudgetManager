const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Invalid current password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Change Password',
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
          label: 'Current Password',
          name: 'currentPassword',
          type: 'password',
          value: currentPassword,
          onChange: (e) => setCurrentPassword(e.target.value),
          required: true
        }
      ),
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
          className: 'w-full'
        },
        'Change Password'
      ),
      success && React.createElement(
        'div',
        { className: 'text-green-500 text-sm' },
        success
      )
    )
  );
};

module.exports = { ChangePassword }; 