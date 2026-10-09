import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-charcoal-200 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-charcoal-900 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-charcoal-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-charcoal-50 border-t border-charcoal-100 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
