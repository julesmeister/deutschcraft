/**
 * CEFRLevelSelector Component
 * Reusable split-button style selector for CEFR levels with customizable color schemes
 */

import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';

interface CEFRLevelSelectorProps {
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  colorScheme?: 'default' | 'warm' | 'cool' | 'vibrant' | 'professional';
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  unavailableLevels?: CEFRLevel[];
}

// Color scheme definitions - Flatter, more muted colors
const COLOR_SCHEMES = {
  default: [
    { bg: 'bg-slate-200', icon: 'bg-slate-600', text: 'text-slate-800', hover: 'hover:bg-slate-300' },
    { bg: 'bg-gray-200', icon: 'bg-gray-600', text: 'text-gray-800', hover: 'hover:bg-gray-300' },
    { bg: 'bg-zinc-200', icon: 'bg-zinc-600', text: 'text-zinc-800', hover: 'hover:bg-zinc-300' },
    { bg: 'bg-neutral-200', icon: 'bg-neutral-600', text: 'text-neutral-800', hover: 'hover:bg-neutral-300' },
    { bg: 'bg-stone-200', icon: 'bg-stone-600', text: 'text-stone-800', hover: 'hover:bg-stone-300' },
    { bg: 'bg-slate-300', icon: 'bg-slate-700', text: 'text-slate-900', hover: 'hover:bg-slate-400' },
  ],
  warm: [
    { bg: 'bg-orange-200', icon: 'bg-orange-600', text: 'text-orange-800', hover: 'hover:bg-orange-300' },
    { bg: 'bg-amber-200', icon: 'bg-amber-600', text: 'text-amber-800', hover: 'hover:bg-amber-300' },
    { bg: 'bg-yellow-200', icon: 'bg-yellow-600', text: 'text-yellow-800', hover: 'hover:bg-yellow-300' },
    { bg: 'bg-red-200', icon: 'bg-red-600', text: 'text-red-800', hover: 'hover:bg-red-300' },
    { bg: 'bg-rose-200', icon: 'bg-rose-600', text: 'text-rose-800', hover: 'hover:bg-rose-300' },
    { bg: 'bg-pink-200', icon: 'bg-pink-600', text: 'text-pink-800', hover: 'hover:bg-pink-300' },
  ],
  cool: [
    { bg: 'bg-cyan-200', icon: 'bg-cyan-600', text: 'text-cyan-800', hover: 'hover:bg-cyan-300' },
    { bg: 'bg-teal-200', icon: 'bg-teal-600', text: 'text-teal-800', hover: 'hover:bg-teal-300' },
    { bg: 'bg-sky-200', icon: 'bg-sky-600', text: 'text-sky-800', hover: 'hover:bg-sky-300' },
    { bg: 'bg-blue-200', icon: 'bg-blue-600', text: 'text-blue-800', hover: 'hover:bg-blue-300' },
    { bg: 'bg-indigo-200', icon: 'bg-indigo-600', text: 'text-indigo-800', hover: 'hover:bg-indigo-300' },
    { bg: 'bg-violet-200', icon: 'bg-violet-600', text: 'text-violet-800', hover: 'hover:bg-violet-300' },
  ],
  vibrant: [
    { bg: 'bg-fuchsia-200', icon: 'bg-fuchsia-600', text: 'text-fuchsia-800', hover: 'hover:bg-fuchsia-300' },
    { bg: 'bg-purple-200', icon: 'bg-purple-600', text: 'text-purple-800', hover: 'hover:bg-purple-300' },
    { bg: 'bg-pink-200', icon: 'bg-pink-600', text: 'text-pink-800', hover: 'hover:bg-pink-300' },
    { bg: 'bg-rose-200', icon: 'bg-rose-600', text: 'text-rose-800', hover: 'hover:bg-rose-300' },
    { bg: 'bg-orange-200', icon: 'bg-orange-600', text: 'text-orange-800', hover: 'hover:bg-orange-300' },
    { bg: 'bg-amber-200', icon: 'bg-amber-600', text: 'text-amber-800', hover: 'hover:bg-amber-300' },
  ],
  professional: [
    { bg: 'bg-slate-200', icon: 'bg-slate-700', text: 'text-slate-900', hover: 'hover:bg-slate-300' },
    { bg: 'bg-gray-200', icon: 'bg-gray-700', text: 'text-gray-900', hover: 'hover:bg-gray-300' },
    { bg: 'bg-zinc-200', icon: 'bg-zinc-700', text: 'text-zinc-900', hover: 'hover:bg-zinc-300' },
    { bg: 'bg-neutral-200', icon: 'bg-neutral-700', text: 'text-neutral-900', hover: 'hover:bg-neutral-300' },
    { bg: 'bg-stone-200', icon: 'bg-stone-700', text: 'text-stone-900', hover: 'hover:bg-stone-300' },
    { bg: 'bg-slate-300', icon: 'bg-slate-800', text: 'text-slate-900', hover: 'hover:bg-slate-400' },
  ],
};

// Size configurations with responsive variants
const SIZE_CLASSES = {
  sm: {
    padding: 'px-2 py-1.5 sm:px-3 sm:py-2',
    fontSize: 'text-sm sm:text-base md:text-lg',
    descSize: 'text-[8px] sm:text-[9px] md:text-[10px]',
    gap: 'mb-0.5',
  },
  md: {
    padding: 'px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3',
    fontSize: 'text-base sm:text-lg md:text-xl',
    descSize: 'text-[9px] sm:text-[10px] md:text-xs',
    gap: 'mb-0.5 sm:mb-1',
  },
  lg: {
    padding: 'px-3 py-2.5 sm:px-4 sm:py-3 md:px-4 md:py-4',
    fontSize: 'text-lg sm:text-xl md:text-2xl',
    descSize: 'text-[10px] sm:text-xs',
    gap: 'mb-0.5 sm:mb-1',
  },
};

export function CEFRLevelSelector({
  selectedLevel,
  onLevelChange,
  colorScheme = 'default',
  showDescription = false,
  size = 'md',
  className = '',
  unavailableLevels = [],
}: CEFRLevelSelectorProps) {
  const colors = COLOR_SCHEMES[colorScheme];
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div className={className}>
      <div className="flex w-full gap-0.5 sm:gap-1">
        {Object.values(CEFRLevel).map((level, index) => {
          const info = CEFRLevelInfo[level];
          const isSelected = selectedLevel === level;
          const isFirst = index === 0;
          const isLast = index === Object.values(CEFRLevel).length - 1;
          const isUnavailable = unavailableLevels.includes(level);

          // Determine border radius based on position - Less rounded for flatter design
          let borderRadius = '';
          if (isFirst) {
            borderRadius = 'rounded-l-md rounded-r-sm';
          } else if (isLast) {
            borderRadius = 'rounded-l-sm rounded-r-md';
          } else {
            borderRadius = 'rounded-sm';
          }

          // Get color scheme for this level
          const colorSet = colors[index % colors.length];

          // Determine styles based on state
          let buttonStyles = '';
          if (isUnavailable) {
            buttonStyles = 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
          } else if (isSelected) {
            buttonStyles = `${colorSet.icon} text-white shadow-md transform scale-105 z-10`;
          } else {
            buttonStyles = `${colorSet.bg} ${colorSet.text} ${colorSet.hover} hover:shadow-sm`;
          }

          return (
            <button
              key={level}
              onClick={() => !isUnavailable && onLevelChange(level)}
              disabled={isUnavailable}
              className={`
                flex-1 ${sizeConfig.padding} transition-all duration-200 
                ${!isUnavailable && 'active:scale-95'}
                ${borderRadius}
                ${buttonStyles}
                min-w-0 relative group
              `}
            >
              <div className={`${sizeConfig.fontSize} font-black ${showDescription ? sizeConfig.gap : ''} leading-tight`}>
                {level}
              </div>
              {showDescription && (
                <div
                  className={`${sizeConfig.descSize} font-medium ${
                    isSelected ? 'text-white opacity-90' : 'opacity-70'
                  } hidden sm:block leading-tight`}
                >
                  {info.displayName}
                </div>
              )}
              
              {/* Tooltip for unavailable levels */}
              {isUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded">
                   <span className="sr-only">Not available</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
