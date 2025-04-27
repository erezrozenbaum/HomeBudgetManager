const React = window.React;
const { AuthFormGroup } = require('./AuthFormGroup');

const AuthTextarea = ({ label, name, value, onChange, error, required, placeholder, disabled, rows = 3 }) => {
  return React.createElement(
    AuthFormGroup,
    { label, error, required },
    React.createElement(
      'textarea',
      {
        name,
        value,
        onChange,
        placeholder,
        disabled,
        rows,
        className: `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-300' : ''} ${disabled ? 'bg-gray-100' : ''}`,
        required
      }
    )
  );
};

module.exports = { AuthTextarea }; 