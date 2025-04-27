const React = window.React;
const { Skeleton } = require('./Skeleton');

const StockListSkeleton = () => {
  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'div',
      { className: 'flex items-center justify-between' },
      React.createElement(Skeleton, { className: 'h-8 w-32' }),
      React.createElement(Skeleton, { className: 'h-8 w-24' })
    ),
    React.createElement(
      'div',
      { className: 'space-y-2' },
      Array.from({ length: 5 }).map((_, index) =>
        React.createElement(
          'div',
          { key: index, className: 'flex items-center justify-between p-4 border rounded-lg' },
          React.createElement(
            'div',
            { className: 'flex items-center space-x-4' },
            React.createElement(Skeleton, { className: 'h-10 w-10 rounded-full' }),
            React.createElement(
              'div',
              { className: 'space-y-2' },
              React.createElement(Skeleton, { className: 'h-4 w-24' }),
              React.createElement(Skeleton, { className: 'h-3 w-16' })
            )
          ),
          React.createElement(
            'div',
            { className: 'text-right space-y-2' },
            React.createElement(Skeleton, { className: 'h-4 w-20' }),
            React.createElement(Skeleton, { className: 'h-3 w-16' })
          )
        )
      )
    )
  );
};

module.exports = { StockListSkeleton }; 