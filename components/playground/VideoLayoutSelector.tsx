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
      <div className="flex w-full gap-1 bg-white rounded-full p-0.5">
        <button
          onClick={() => onLayoutChange('teacher')}
          className={`
            flex-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 transition-all duration-200
            rounded-full
            text-xs sm:text-sm font-bold
            ${
              layout === 'teacher'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
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
            rounded-full
            text-xs sm:text-sm font-bold
            ${
              layout === 'top-left'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
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
            rounded-full
            text-xs sm:text-sm font-bold
            ${
              layout === 'top-right'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100'
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
