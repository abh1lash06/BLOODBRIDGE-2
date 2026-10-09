import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') =>
      addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') =>
      addToast({ type: 'error', title, message }),
    warning: (message, title = 'Warning') =>
      addToast({ type: 'warning', title, message }),
    info: (message, title = 'Notice') =>
      addToast({ type: 'info', title, message }),
    dismiss: removeToast,
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container floating top right */}
      <div
        className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-md transition-all duration-200 ${getBorderColor(
              item.type
            )}`}
            role="status"
          >
            {getIcon(item.type)}
            <div className="flex-1 text-sm">
              {item.title && (
                <p className="font-semibold text-charcoal-900 leading-none mb-1">
                  {item.title}
                </p>
              )}
              <p className="text-charcoal-700 leading-snug">{item.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-charcoal-400 hover:text-charcoal-700 p-1 -mr-1 -mt-1 rounded"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
