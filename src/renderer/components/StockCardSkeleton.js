const React = window.React;
const { Skeleton } = require('./Skeleton');

const StockCardSkeleton = () => {
  return React.createElement(
    'div',
    { className: 'p-4 border rounded-lg space-y-4' },
    React.createElement(
      'div',
      { className: 'flex items-center space-x-4' },
      React.createElement(Skeleton, { className: 'h-12 w-12 rounded-full' }),
      React.createElement(
        'div',
        { className: 'flex-1 space-y-2' },
        React.createElement(Skeleton, { className: 'h-4 w-3/4' }),
        React.createElement(Skeleton, { className: 'h-4 w-1/2' })
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement(Skeleton, { className: 'h-4 w-1/2' }),
        React.createElement(Skeleton, { className: 'h-6 w-3/4' })
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement(Skeleton, { className: 'h-4 w-1/2' }),
        React.createElement(Skeleton, { className: 'h-6 w-3/4' })
      )
    )
  );
};

module.exports = { StockCardSkeleton }; 