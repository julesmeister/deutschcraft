'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageNumbers = true,
}: PaginationProps) {
  // Always show pagination, even with 1 page
  const pages = totalPages < 1 ? 1 : totalPages;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers array
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className={`text-center mt-6 mb-0 ${className}`}>
      <div className="inline-flex h-[45px] px-4 rounded-[22px] bg-gray-100">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="block px-4 float-left transition-all duration-400 ease-in-out text-gray-600 text-sm font-medium tracking-wide leading-[45px] hover:bg-transparent hover:text-piku-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          prev
        </button>

        {/* Page Numbers */}
        {showPageNumbers && pageNumbers.map((page, index) => {
          // On mobile, only show first 2, last 2, and ellipsis
          const isMobileVisible =
            index < 2 || // First 2 pages
            index >= pages - 2 || // Last 2 pages
            page === currentPage; // Current page

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                block px-4 float-left transition-all duration-400 ease-in-out text-sm font-medium tracking-wide leading-[45px]
                ${
                  page === currentPage
                    ? 'bg-piku-purple text-white rounded-lg'
                    : 'text-gray-600 hover:bg-piku-purple hover:text-white hover:rounded-lg'
                }
                ${!isMobileVisible ? 'max-md:hidden' : ''}
                ${
                  index === 1 && pages > 4
                    ? 'max-md:pr-[50px] max-md:relative max-md:after:content-["..."] max-md:after:absolute max-md:after:text-[20px] max-md:after:top-0 max-md:after:left-[40px]'
                    : ''
                }
                ${
                  index >= pages - 3
                    ? 'max-md:pr-4 max-md:after:content-none'
                    : ''
                }
              `}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === pages}
          className="block px-4 float-left transition-all duration-400 ease-in-out text-gray-600 text-sm font-medium tracking-wide leading-[45px] hover:bg-transparent hover:text-piku-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          next
        </button>
      </div>
    </div>
  );
}
