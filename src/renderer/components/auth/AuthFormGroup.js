const React = window.React;

const AuthFormGroup = ({ label, children, error, required }) => {
  return React.createElement(
    'div',
    { className: 'space-y-2' },
    label && React.createElement(
      'label',
      { className: 'block text-sm font-medium text-gray-700' },
      label,
      required && React.createElement(
        'span',
        { className: 'text-red-500 ml-1' },
        '*'
      )
    ),
    children,
    error && React.createElement(
      'p',
      { className: 'mt-1 text-sm text-red-600' },
      error
    )
  );
};

module.exports = { AuthFormGroup }; 