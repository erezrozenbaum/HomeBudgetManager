const React = window.React;

const Skeleton = ({ className = '', children }) => {
  return React.createElement(
    'div',
    { className: `animate-pulse ${className}` },
    children || React.createElement(
      'div',
      { className: 'h-4 bg-gray-200 rounded' }
    )
  );
};

const StockListSkeleton = () => {
  return React.createElement(
    'div',
    { className: 'space-y-4' },
    Array.from({ length: 5 }).map((_, index) =>
      React.createElement(
        'div',
        {
          key: index,
          'data-testid': 'skeleton',
          className: 'h-16 w-full animate-pulse bg-gray-200 rounded'
        }
      )
    )
  );
};

const StockDetailsSkeleton = () => {
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      {
        'data-testid': 'skeleton-title',
        className: 'h-8 w-1/2 animate-pulse bg-gray-200 rounded'
      }
    ),
    React.createElement(
      'div',
      { className: 'space-y-4' },
      Array.from({ length: 3 }).map((_, index) =>
        React.createElement(
          'div',
          {
            key: index,
            'data-testid': 'skeleton-text',
            className: 'h-4 w-full animate-pulse bg-gray-200 rounded'
          }
        )
      )
    ),
    React.createElement(
      'div',
      {
        'data-testid': 'skeleton-chart',
        className: 'h-64 w-full animate-pulse bg-gray-200 rounded'
      }
    )
  );
};

module.exports = { Skeleton, StockListSkeleton, StockDetailsSkeleton }; 