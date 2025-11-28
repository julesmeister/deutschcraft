import { ReactNode } from 'react';

export interface SplitButtonOption {
  value: string;
  label: ReactNode;
  description?: string;
}

interface SplitButtonGroupProps {
  options: SplitButtonOption[];
  value: string;
  onChange: (value: string) => void;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink' | 'cyan' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-100',
    selectedBg: 'bg-blue-500',
    text: 'text-blue-900',
    selectedText: 'text-white',
    hover: 'hover:bg-blue-600',
  },
  emerald: {
    bg: 'bg-emerald-100',
    selectedBg: 'bg-emerald-500',
    text: 'text-emerald-900',
    selectedText: 'text-white',
    hover: 'hover:bg-emerald-600',
  },
  amber: {
    bg: 'bg-amber-100',
    selectedBg: 'bg-amber-500',
    text: 'text-amber-900',
    selectedText: 'text-white',
    hover: 'hover:bg-amber-600',
  },
  purple: {
    bg: 'bg-purple-100',
    selectedBg: 'bg-purple-500',
    text: 'text-purple-900',
    selectedText: 'text-white',
    hover: 'hover:bg-purple-600',
  },
  pink: {
    bg: 'bg-pink-100',
    selectedBg: 'bg-pink-500',
    text: 'text-pink-900',
    selectedText: 'text-white',
    hover: 'hover:bg-pink-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    selectedBg: 'bg-cyan-500',
    text: 'text-cyan-900',
    selectedText: 'text-white',
    hover: 'hover:bg-cyan-600',
  },
  teal: {
    bg: 'bg-white',
    selectedBg: 'bg-piku-mint',
    text: 'text-gray-900',
    selectedText: 'text-gray-900',
    hover: 'hover:bg-gray-700 hover:text-white',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1.5 md:px-3 md:py-2 text-sm',
  md: 'px-3 py-2 md:px-4 md:py-3 text-base',
  lg: 'px-3 py-2.5 md:px-5 md:py-3.5 lg:px-6 lg:py-4 text-lg',
};

export function SplitButtonGroup({
  options,
  value,
  onChange,
  colorScheme = 'blue',
  size = 'md',
  className = '',
}: SplitButtonGroupProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div className={`flex w-full gap-1 ${className}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        // Determine border radius based on position
        let borderRadius = '';
        if (isFirst) {
          borderRadius = 'rounded-l-[20px] rounded-r-[5px]';
        } else if (isLast) {
          borderRadius = 'rounded-l-[5px] rounded-r-[20px]';
        } else {
          borderRadius = 'rounded-[5px]';
        }

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-1 ${sizeClasses[size]} ${borderRadius}
              font-bold transition-all
              ${isSelected
                ? `${colors.selectedBg} ${colors.selectedText}`
                : `${colors.bg} ${colors.text} ${colors.hover}`
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
