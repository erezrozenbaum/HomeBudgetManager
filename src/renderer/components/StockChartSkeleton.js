const React = window.React;
const { Skeleton } = require('./Skeleton');

const StockChartSkeleton = () => {
  return React.createElement(
    'div',
    { className: 'p-4 border rounded-lg space-y-4' },
    React.createElement(
      'div',
      { className: 'flex items-center justify-between' },
      React.createElement(Skeleton, { className: 'h-6 w-32' }),
      React.createElement(Skeleton, { className: 'h-6 w-24' })
    ),
    React.createElement(
      'div',
      { className: 'h-64 relative' },
      React.createElement(Skeleton, { className: 'h-full w-full' })
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-4 gap-4' },
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
      ),
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

module.exports = { StockChartSkeleton }; 