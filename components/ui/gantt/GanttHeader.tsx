'use client';

interface GanttHeaderProps {
  title?: string;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export function GanttHeader({ title, onScrollLeft, onScrollRight }: GanttHeaderProps) {
  if (!title) return null;

  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      <div className="flex gap-2">
        <button
          onClick={onScrollLeft}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onScrollRight}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
