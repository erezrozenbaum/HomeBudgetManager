const React = window.React;

const AuthDivider = ({ text }) => {
  return React.createElement(
    'div',
    { className: 'relative' },
    React.createElement(
      'div',
      { className: 'absolute inset-0 flex items-center' },
      React.createElement(
        'div',
        { className: 'w-full border-t border-gray-300' }
      )
    ),
    React.createElement(
      'div',
      { className: 'relative flex justify-center text-sm' },
      React.createElement(
        'span',
        { className: 'px-2 bg-white text-gray-500' },
        text
      )
    )
  );
};

module.exports = { AuthDivider }; 