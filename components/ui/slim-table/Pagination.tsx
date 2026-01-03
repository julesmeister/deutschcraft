import { PageNumbers } from './PageNumbers';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-200">
      {/* Desktop: Show results count */}
      <div className="hidden sm:flex items-center gap-2">
        <p className="text-sm text-gray-600">
          Showing {((currentPage - 1) * pageSize) + 1} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of{' '}
          {totalItems} results
        </p>
      </div>

      {/* Mobile: Show page info */}
      <div className="sm:hidden flex items-center gap-2">
        <p className="text-xs text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-black/54 hover:bg-black/5 active:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          type="button"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>

        <PageNumbers
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-black/54 hover:bg-black/5 active:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          type="button"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
