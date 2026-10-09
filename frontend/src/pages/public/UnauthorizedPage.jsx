import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 bg-red-100 rounded-full text-red-600 mb-2">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-charcoal-900">Access Denied</h1>
      <p className="text-charcoal-600 max-w-md text-sm leading-relaxed">
        You do not have the required permissions to view this dashboard or resource. Please ensure you are logged into an authorized account.
      </p>
      <div className="pt-4 flex gap-3">
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
