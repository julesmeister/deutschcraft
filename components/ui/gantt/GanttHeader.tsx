'use client';

interface GanttHeaderProps {
  title?: string;
  onPreviousRange: () => void;
  onNextRange: () => void;
  onAddTask?: () => void;
  rangeLabel?: string;
}

export function GanttHeader({
  title,
  onPreviousRange,
  onNextRange,
  onAddTask,
  rangeLabel
}: GanttHeaderProps) {
  if (!title) return null;

  return (
    <div className="px-5 py-2.5 flex items-center justify-between border-b border-gray-200">
      <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      <div className="flex items-center gap-3">
        {/* Add button */}
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="px-3 py-1.5 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200 rounded-md"
            aria-label="Add task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add</span>
          </button>
        )}

        {/* Month range selector */}
        <div className="flex items-center divide-x divide-gray-200 border border-gray-200 rounded-md">
          <button
            onClick={onPreviousRange}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-md"
            aria-label="Previous 3 months"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 min-w-[180px] text-center">
            {rangeLabel || 'Select Range'}
          </div>
          <button
            onClick={onNextRange}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-md"
            aria-label="Next 3 months"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
