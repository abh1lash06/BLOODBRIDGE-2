import React from 'react';

export const FormField = ({
  label,
  error,
  required = false,
  hint,
  id,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-charcoal-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-charcoal-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
