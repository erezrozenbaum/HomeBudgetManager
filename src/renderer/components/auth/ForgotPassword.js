const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const success = await resetPassword(email);
      if (success) {
        setSuccess('Password reset instructions have been sent to your email');
        setEmail('');
      } else {
        setError('No account found with this email address');
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
      title: 'Forgot Password',
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
          label: 'Email Address',
          name: 'email',
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
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
        isLoading ? 'Sending...' : 'Reset Password'
      ),
      success && React.createElement(
        'div',
        { className: 'text-green-500 text-sm' },
        success
      )
    )
  );
};

module.exports = { ForgotPassword }; 