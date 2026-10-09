import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, details, className = '' }) => {
  if (!message && (!details || details.length === 0)) return null;

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          {message && <p className="font-semibold">{message}</p>}
          {details && details.length > 0 && (
            <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-xs text-red-700">
              {details.map((d, idx) => (
                <li key={idx}>
                  {d.field ? <span className="font-medium">{d.field}: </span> : null}
                  {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
