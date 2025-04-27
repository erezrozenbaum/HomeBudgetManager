const React = window.React;
const { AuthFormGroup } = require('./AuthFormGroup');

const AuthSelect = ({ label, name, value, onChange, options, error, required, disabled }) => {
  return React.createElement(
    AuthFormGroup,
    { label, error, required },
    React.createElement(
      'select',
      {
        name,
        value,
        onChange,
        disabled,
        className: `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-300' : ''} ${disabled ? 'bg-gray-100' : ''}`,
        required
      },
      options.map((option) => 
        React.createElement(
          'option',
          { key: option.value, value: option.value },
          option.label
        )
      )
    )
  );
};

module.exports = { AuthSelect }; 