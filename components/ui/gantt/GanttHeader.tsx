'use client';

interface GanttHeaderProps {
  title?: string;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onAddTask?: () => void;
}

export function GanttHeader({ title, onScrollLeft, onScrollRight, onAddTask }: GanttHeaderProps) {
  if (!title) return null;

  return (
    <div className="px-5 py-2.5 flex items-center justify-between border-b border-gray-200">
      <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      <div className="flex items-center divide-x divide-gray-200 border border-gray-200 rounded-md">
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="px-3 py-1.5 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors first:rounded-l-md"
            aria-label="Add task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add</span>
          </button>
        )}
        <button
          onClick={onScrollLeft}
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onScrollRight}
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors last:rounded-r-md"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
