interface BatchTableHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
}

export function BatchTableHeader({ searchQuery, onSearchChange, onCreateClick }: BatchTableHeaderProps) {
  return (
    <div className="m-3 sm:m-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
          All Batches
        </h5>
        <button
          onClick={onCreateClick}
          className="group inline-flex items-center font-black text-[13px] sm:text-[14px] py-1.5 pl-4 sm:pl-5 pr-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
        >
          <span className="relative z-10 transition-colors duration-300">
            Create Batch
          </span>
          <span className="relative z-10 ml-3 sm:ml-4 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-white text-gray-900">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search batches..."
          className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
}
