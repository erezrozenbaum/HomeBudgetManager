const React = window.React;
const { Card } = require('../Card');
const { Button } = require('../Button');

const TransactionTemplate = ({ transaction, onEdit, onDelete }) => {
  return React.createElement(
    Card,
    { className: 'mb-4' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h3',
          { className: 'text-lg font-medium' },
          transaction.description
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          `Amount: ${transaction.amount}`
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          `Date: ${new Date(transaction.date).toLocaleDateString()}`
        )
      ),
      React.createElement(
        'div',
        { className: 'flex space-x-2' },
        React.createElement(
          Button,
          {
            onClick: () => onEdit(transaction),
            className: 'bg-blue-500 hover:bg-blue-600'
          },
          'Edit'
        ),
        React.createElement(
          Button,
          {
            onClick: () => onDelete(transaction.id),
            className: 'bg-red-500 hover:bg-red-600'
          },
          'Delete'
        )
      )
    )
  );
};

module.exports = { TransactionTemplate }; 