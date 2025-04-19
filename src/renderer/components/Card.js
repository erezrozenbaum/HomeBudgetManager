import React from 'react';

function Card({
  children,
  title,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow p-6
        border border-gray-200 dark:border-gray-700
        ${className}
      `}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export default Card; 