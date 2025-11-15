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
}

// Color scheme definitions
const COLOR_SCHEMES = {
  default: [
    { bg: 'bg-blue-100', icon: 'bg-blue-500', text: 'text-blue-900', hover: 'hover:bg-blue-200' },
    { bg: 'bg-emerald-100', icon: 'bg-emerald-500', text: 'text-emerald-900', hover: 'hover:bg-emerald-200' },
    { bg: 'bg-amber-100', icon: 'bg-amber-500', text: 'text-amber-900', hover: 'hover:bg-amber-200' },
    { bg: 'bg-purple-100', icon: 'bg-purple-500', text: 'text-purple-900', hover: 'hover:bg-purple-200' },
    { bg: 'bg-pink-100', icon: 'bg-pink-500', text: 'text-pink-900', hover: 'hover:bg-pink-200' },
    { bg: 'bg-indigo-100', icon: 'bg-indigo-500', text: 'text-indigo-900', hover: 'hover:bg-indigo-200' },
  ],
  warm: [
    { bg: 'bg-orange-100', icon: 'bg-orange-500', text: 'text-orange-900', hover: 'hover:bg-orange-200' },
    { bg: 'bg-amber-100', icon: 'bg-amber-500', text: 'text-amber-900', hover: 'hover:bg-amber-200' },
    { bg: 'bg-yellow-100', icon: 'bg-yellow-500', text: 'text-yellow-900', hover: 'hover:bg-yellow-200' },
    { bg: 'bg-red-100', icon: 'bg-red-500', text: 'text-red-900', hover: 'hover:bg-red-200' },
    { bg: 'bg-rose-100', icon: 'bg-rose-500', text: 'text-rose-900', hover: 'hover:bg-rose-200' },
    { bg: 'bg-pink-100', icon: 'bg-pink-500', text: 'text-pink-900', hover: 'hover:bg-pink-200' },
  ],
  cool: [
    { bg: 'bg-cyan-100', icon: 'bg-cyan-500', text: 'text-cyan-900', hover: 'hover:bg-cyan-200' },
    { bg: 'bg-teal-100', icon: 'bg-teal-500', text: 'text-teal-900', hover: 'hover:bg-teal-200' },
    { bg: 'bg-sky-100', icon: 'bg-sky-500', text: 'text-sky-900', hover: 'hover:bg-sky-200' },
    { bg: 'bg-blue-100', icon: 'bg-blue-500', text: 'text-blue-900', hover: 'hover:bg-blue-200' },
    { bg: 'bg-indigo-100', icon: 'bg-indigo-500', text: 'text-indigo-900', hover: 'hover:bg-indigo-200' },
    { bg: 'bg-violet-100', icon: 'bg-violet-500', text: 'text-violet-900', hover: 'hover:bg-violet-200' },
  ],
  vibrant: [
    { bg: 'bg-fuchsia-100', icon: 'bg-fuchsia-500', text: 'text-fuchsia-900', hover: 'hover:bg-fuchsia-200' },
    { bg: 'bg-purple-100', icon: 'bg-purple-500', text: 'text-purple-900', hover: 'hover:bg-purple-200' },
    { bg: 'bg-pink-100', icon: 'bg-pink-500', text: 'text-pink-900', hover: 'hover:bg-pink-200' },
    { bg: 'bg-rose-100', icon: 'bg-rose-500', text: 'text-rose-900', hover: 'hover:bg-rose-200' },
    { bg: 'bg-orange-100', icon: 'bg-orange-500', text: 'text-orange-900', hover: 'hover:bg-orange-200' },
    { bg: 'bg-amber-100', icon: 'bg-amber-500', text: 'text-amber-900', hover: 'hover:bg-amber-200' },
  ],
  professional: [
    { bg: 'bg-slate-100', icon: 'bg-slate-600', text: 'text-slate-900', hover: 'hover:bg-slate-200' },
    { bg: 'bg-gray-100', icon: 'bg-gray-600', text: 'text-gray-900', hover: 'hover:bg-gray-200' },
    { bg: 'bg-zinc-100', icon: 'bg-zinc-600', text: 'text-zinc-900', hover: 'hover:bg-zinc-200' },
    { bg: 'bg-neutral-100', icon: 'bg-neutral-600', text: 'text-neutral-900', hover: 'hover:bg-neutral-200' },
    { bg: 'bg-stone-100', icon: 'bg-stone-600', text: 'text-stone-900', hover: 'hover:bg-stone-200' },
    { bg: 'bg-slate-200', icon: 'bg-slate-700', text: 'text-slate-900', hover: 'hover:bg-slate-300' },
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

          // Determine border radius based on position with responsive sizes
          let borderRadius = '';
          if (isFirst) {
            borderRadius = 'rounded-l-[12px] sm:rounded-l-[16px] md:rounded-l-[20px] rounded-r-[4px] sm:rounded-r-[5px]';
          } else if (isLast) {
            borderRadius = 'rounded-l-[4px] sm:rounded-l-[5px] rounded-r-[12px] sm:rounded-r-[16px] md:rounded-r-[20px]';
          } else {
            borderRadius = 'rounded-[4px] sm:rounded-[5px]';
          }

          // Get color scheme for this level
          const colorSet = colors[index % colors.length];

          return (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              className={`
                flex-1 ${sizeConfig.padding} transition-all duration-200 active:scale-95
                ${borderRadius}
                ${
                  isSelected
                    ? `${colorSet.icon} text-white shadow-sm`
                    : `${colorSet.bg} ${colorSet.text} ${colorSet.hover}`
                }
                min-w-0
              `}
            >
              <div className={`${sizeConfig.fontSize} font-black ${showDescription ? sizeConfig.gap : ''} leading-tight`}>{level}</div>
              {showDescription && (
                <div
                  className={`${sizeConfig.descSize} font-medium ${
                    isSelected ? 'text-white opacity-90' : 'opacity-70'
                  } hidden sm:block leading-tight`}
                >
                  {info.displayName}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
