interface PageNumbersProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PageNumbers({ currentPage, totalPages, onPageChange }: PageNumbersProps) {
  return (
    <div className="hidden sm:flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const showPage =
          page === 1 ||
          page === totalPages ||
          Math.abs(page - currentPage) <= 1;

        const showEllipsisBefore =
          page === currentPage - 2 && currentPage > 3;
        const showEllipsisAfter =
          page === currentPage + 2 &&
          currentPage < totalPages - 2;

        if (showEllipsisBefore || showEllipsisAfter) {
          return (
            <span
              key={`ellipsis-${page}`}
              className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-600"
            >
              ...
            </span>
          );
        }

        if (!showPage) return null;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-blue-700 text-white'
                : 'text-gray-700 hover:bg-black/5 active:bg-black/10'
            }`}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}
