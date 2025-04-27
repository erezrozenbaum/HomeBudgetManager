const React = window.React;

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return React.createElement(
    'div',
    {
      className: 'fixed inset-0 z-50 overflow-y-auto',
      'aria-labelledby': 'modal-title',
      role: 'dialog',
      'aria-modal': true
    },
    React.createElement(
      'div',
      {
        className: 'flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'
      },
      React.createElement(
        'div',
        {
          className: 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
          'aria-hidden': true,
          onClick: onClose
        }
      ),
      React.createElement(
        'span',
        {
          className: 'hidden sm:inline-block sm:align-middle sm:h-screen',
          'aria-hidden': true
        },
        '​'
      ),
      React.createElement(
        'div',
        {
          className: `
            inline-block align-bottom bg-white dark:bg-gray-800
            rounded-lg text-left overflow-hidden shadow-xl
            transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
            ${className}
          `
        },
        React.createElement(
          'div',
          { className: 'bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4' },
          title && React.createElement(
            'div',
            { className: 'mb-4' },
            React.createElement(
              'h3',
              {
                className: 'text-lg leading-6 font-medium text-gray-900 dark:text-white',
                id: 'modal-title'
              },
              title
            )
          ),
          children
        ),
        React.createElement(
          'div',
          { className: 'bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse' },
          React.createElement(
            'button',
            {
              type: 'button',
              className: `
                mt-3 w-full inline-flex justify-center rounded-md border border-gray-300
                shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm
              `,
              onClick: onClose
            },
            'Close'
          )
        )
      )
    )
  );
};

module.exports = { Modal }; 