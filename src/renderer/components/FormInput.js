const React = window.React;

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = '',
  ...props
}) => {
  return React.createElement(
    'div',
    { className: `space-y-1 ${className}` },
    label && React.createElement(
      'label',
      {
        htmlFor: name,
        className: 'block text-sm font-medium text-gray-700 dark:text-gray-300'
      },
      label,
      required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
    ),
    React.createElement(
      'input',
      {
        id: name,
        name,
        type,
        value,
        onChange,
        placeholder,
        className: `
          mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600
          shadow-sm focus:border-primary-500 focus:ring-primary-500
          dark:bg-gray-700 dark:text-white
          ${error ? 'border-red-500' : ''}
        `,
        required,
        ...props
      }
    ),
    error && React.createElement(
      'p',
      { className: 'text-sm text-red-600 dark:text-red-400' },
      error
    )
  );
};

module.exports = { FormInput }; 