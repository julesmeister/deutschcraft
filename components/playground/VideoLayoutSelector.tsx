/**
 * VideoLayoutSelector Component
 * Segmented control for selecting video layout mode
 */

'use client';

export type VideoLayout = 'teacher' | 'top-left' | 'top-right';

interface VideoLayoutSelectorProps {
  layout: VideoLayout;
  onLayoutChange: (layout: VideoLayout) => void;
}

export function VideoLayoutSelector({ layout, onLayoutChange }: VideoLayoutSelectorProps) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <p className="text-[10px] sm:text-xs font-medium text-gray-600">Video Layout</p>
      <div className="flex w-full gap-0.5">
        <button
          onClick={() => onLayoutChange('teacher')}
          className={`
            flex-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 transition-all duration-200
            rounded-l-md rounded-r-sm
            text-xs sm:text-sm font-bold
            ${
              layout === 'teacher'
                ? 'bg-slate-700 text-white shadow-md transform scale-105 z-10'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300 hover:shadow-sm'
            }
            active:scale-95
          `}
        >
          Teacher
        </button>
        <button
          onClick={() => onLayoutChange('top-left')}
          className={`
            flex-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 transition-all duration-200
            rounded-sm
            text-xs sm:text-sm font-bold
            ${
              layout === 'top-left'
                ? 'bg-gray-700 text-white shadow-md transform scale-105 z-10'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-sm'
            }
            active:scale-95
          `}
        >
          <span className="hidden xs:inline">Top </span>Left
        </button>
        <button
          onClick={() => onLayoutChange('top-right')}
          className={`
            flex-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 transition-all duration-200
            rounded-l-sm rounded-r-md
            text-xs sm:text-sm font-bold
            ${
              layout === 'top-right'
                ? 'bg-zinc-700 text-white shadow-md transform scale-105 z-10'
                : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 hover:shadow-sm'
            }
            active:scale-95
          `}
        >
          <span className="hidden xs:inline">Top </span>Right
        </button>
      </div>
    </div>
  );
}
