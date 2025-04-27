const React = window.React;
const { AuthFormGroup } = require('./AuthFormGroup');

const AuthCheckbox = ({ label, name, checked, onChange, error, required }) => {
  return React.createElement(
    AuthFormGroup,
    { label, error, required },
    React.createElement(
      'div',
      { className: 'flex items-center' },
      React.createElement(
        'input',
        {
          type: 'checkbox',
          name,
          checked,
          onChange,
          className: 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
          required
        }
      ),
      React.createElement(
        'label',
        { htmlFor: name, className: 'ml-2 block text-sm text-gray-900' },
        label
      )
    )
  );
};

module.exports = { AuthCheckbox }; 