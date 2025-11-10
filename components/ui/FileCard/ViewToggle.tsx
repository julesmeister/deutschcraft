'use client';

export interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

/**
 * Toggle between grid and list view
 * Displays as a segmented control with two buttons
 */
export function ViewToggle({ view, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`inline-flex p-1 rounded-xl gap-y-2 gap-x-2 bg-neutral-100 ${className}`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`md:w-auto cursor-pointer select-none font-semibold duration-100 ease-in-out rounded-xl h-10 px-3 py-2 text-xl leading-snug ${
          view === 'grid'
            ? 'text-neutral-800 bg-white shadow-sm'
            : 'hover:text-neutral-800'
        }`}
      >
        <svg
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 fill-none stroke-current"
        >
          <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
        </svg>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`md:w-auto cursor-pointer select-none font-semibold duration-100 ease-in-out rounded-xl h-10 px-3 py-2 text-xl leading-snug ${
          view === 'list'
            ? 'text-neutral-800 bg-white shadow-sm'
            : 'hover:text-neutral-800'
        }`}
      >
        <svg
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 fill-none stroke-current"
        >
          <path d="M9 6l11 0"></path>
          <path d="M9 12l11 0"></path>
          <path d="M9 18l11 0"></path>
          <path d="M5 6l0 .01"></path>
          <path d="M5 12l0 .01"></path>
          <path d="M5 18l0 .01"></path>
        </svg>
      </button>
    </div>
  );
}
