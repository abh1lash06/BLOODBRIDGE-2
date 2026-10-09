import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FormField from './FormField';

export const Input = forwardRef(
  (
    {
      id,
      label,
      error,
      required,
      hint,
      type = 'text',
      className = '',
      isPassword = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputElement = (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          required={required}
          className={`w-full px-3.5 py-2 text-sm text-charcoal-900 bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-charcoal-50 disabled:text-charcoal-400 disabled:cursor-not-allowed ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-charcoal-300 focus:border-crimson-500 focus:ring-crimson-200'
          } ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-400 hover:text-charcoal-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );

    if (!label && !error && !hint) {
      return inputElement;
    }

    return (
      <FormField id={id} label={label} error={error} required={required} hint={hint}>
        {inputElement}
      </FormField>
    );
  }
);

Input.displayName = 'Input';
export default Input;
