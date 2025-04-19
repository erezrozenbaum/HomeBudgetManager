import React from 'react';

const Skeleton = ({ type = 'text', width = 'w-full' }) => {
  const getClasses = () => {
    switch (type) {
      case 'text':
        return `h-4 ${width}`;
      case 'title':
        return 'h-6 w-3/4';
      case 'avatar':
        return 'h-10 w-10 rounded-full';
      case 'card':
        return 'h-32 w-full';
      case 'table':
        return 'h-12 w-full';
      case 'chart':
        return 'h-64 w-full';
      default:
        return `h-4 ${width}`;
    }
  };

  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse bg-gray-200 rounded ${getClasses()}`}
    />
  );
};

export const StockListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          data-testid="skeleton"
          className="h-16 w-full animate-pulse bg-gray-200 rounded"
        />
      ))}
    </div>
  );
};

export const StockDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div
        data-testid="skeleton-title"
        className="h-8 w-1/2 animate-pulse bg-gray-200 rounded"
      />
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            data-testid="skeleton-text"
            className="h-4 w-full animate-pulse bg-gray-200 rounded"
          />
        ))}
      </div>
      <div
        data-testid="skeleton-chart"
        className="h-64 w-full animate-pulse bg-gray-200 rounded"
      />
    </div>
  );
};

export default Skeleton; 