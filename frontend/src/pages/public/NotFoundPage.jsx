import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '@/components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 bg-crimson-100 rounded-full text-crimson-600 mb-2">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-charcoal-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-charcoal-800">Page Not Found</h2>
      <p className="text-charcoal-500 max-w-sm text-sm">
        The page you are looking for does not exist or has been moved to a different address.
      </p>
      <div className="pt-4">
        <Link to="/">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
