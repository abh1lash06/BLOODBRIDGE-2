import React, { forwardRef } from 'react';
import FormField from './FormField';

export const Select = forwardRef(
  (
    {
      id,
      label,
      error,
      required,
      hint,
      options = [],
      placeholder = 'Select an option',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const selectElement = (
      <select
        ref={ref}
        id={id}
        required={required}
        className={`w-full px-3.5 py-2 text-sm text-charcoal-900 bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-charcoal-50 disabled:text-charcoal-400 disabled:cursor-not-allowed ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-charcoal-300 focus:border-crimson-500 focus:ring-crimson-200'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
    );

    if (!label && !error && !hint) {
      return selectElement;
    }

    return (
      <FormField id={id} label={label} error={error} required={required} hint={hint}>
        {selectElement}
      </FormField>
    );
  }
);

Select.displayName = 'Select';
export default Select;
