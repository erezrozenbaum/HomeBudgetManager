const React = window.React;
const { useAuth } = require('../../context/AuthContext');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Card } = require('../Card');

const Login = () => {
  const { verifyPassword } = useAuth();
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await verifyPassword(password);
      if (!success) {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Login',
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
          label: 'Password',
          name: 'password',
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
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
        'Login'
      )
    )
  );
};

module.exports = { Login }; 