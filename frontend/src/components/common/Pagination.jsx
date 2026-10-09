import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  page = 0,
  totalPages = 1,
  onPageChange,
  totalElements,
  size = 20,
}) => {
  if (totalPages <= 1) return null;

  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements || (page + 1) * size);

  return (
    <div className="flex items-center justify-between border-t border-charcoal-200 px-4 py-3 sm:px-6">
      <div className="text-sm text-charcoal-500">
        Showing <span className="font-medium text-charcoal-800">{startItem}</span> to{' '}
        <span className="font-medium text-charcoal-800">{endItem}</span>
        {totalElements !== undefined && (
          <>
            {' '}
            of <span className="font-medium text-charcoal-800">{totalElements}</span> results
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="text-sm text-charcoal-600 px-2">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
