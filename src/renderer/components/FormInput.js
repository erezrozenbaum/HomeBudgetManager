import React from 'react';

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600
          shadow-sm focus:border-primary-500 focus:ring-primary-500
          dark:bg-gray-700 dark:text-white
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        required={required}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default FormInput; 