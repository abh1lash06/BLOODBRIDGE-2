import React, { forwardRef } from 'react';
import FormField from './FormField';

export const Textarea = forwardRef(
  (
    {
      id,
      label,
      error,
      required,
      hint,
      rows = 3,
      className = '',
      ...props
    },
    ref
  ) => {
    const textareaElement = (
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        className={`w-full px-3.5 py-2 text-sm text-charcoal-900 bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-charcoal-50 disabled:text-charcoal-400 disabled:cursor-not-allowed resize-y ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-charcoal-300 focus:border-crimson-500 focus:ring-crimson-200'
        } ${className}`}
        {...props}
      />
    );

    if (!label && !error && !hint) {
      return textareaElement;
    }

    return (
      <FormField id={id} label={label} error={error} required={required} hint={hint}>
        {textareaElement}
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
