'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ActionButtonDropdownProps {
  /** Main button text */
  label: string;
  /** Dropdown menu items */
  items: DropdownItem[];
  /** Icon to show on the trigger button */
  icon?: ReactNode;
  /** Button color variant */
  variant?: 'purple' | 'cyan' | 'mint' | 'yellow' | 'orange' | 'gold' | 'gray' | 'red' | 'white';
  /** Additional CSS classes */
  className?: string;
  /** Disable the entire dropdown */
  disabled?: boolean;
  /** Size variant */
  size?: 'default' | 'compact';
}

const variantStyles = {
  purple: 'bg-piku-purple-dark text-white hover:brightness-110 hover:shadow-lg',
  cyan: 'bg-piku-cyan text-gray-900 hover:brightness-95 hover:shadow-lg',
  mint: 'bg-piku-mint text-gray-900 hover:brightness-95 hover:shadow-lg',
  yellow: 'bg-piku-yellow-light text-gray-900 hover:brightness-95 hover:shadow-lg',
  orange: 'bg-piku-orange text-white hover:brightness-110 hover:shadow-lg',
  gold: 'bg-piku-gold text-gray-900 hover:brightness-95 hover:shadow-lg',
  gray: 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-lg',
  red: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
  white: 'bg-white text-gray-900 hover:bg-gray-100 hover:shadow-lg',
};

const iconBgStyles = {
  purple: 'bg-white/20 group-hover:bg-white/30',
  cyan: 'bg-white/30 group-hover:bg-white/40',
  mint: 'bg-white/30 group-hover:bg-white/40',
  yellow: 'bg-white/30 group-hover:bg-white/40',
  orange: 'bg-white/20 group-hover:bg-white/30',
  gold: 'bg-white/30 group-hover:bg-white/40',
  gray: 'bg-white/20 group-hover:bg-white/30',
  red: 'bg-white/20 group-hover:bg-white/30',
  white: 'bg-gray-100 group-hover:bg-gray-200',
};

const dropdownBgStyles = {
  purple: 'bg-piku-purple-dark',
  cyan: 'bg-piku-cyan',
  mint: 'bg-piku-mint',
  yellow: 'bg-piku-yellow-light',
  orange: 'bg-piku-orange',
  gold: 'bg-piku-gold',
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  white: 'bg-white border border-gray-200',
};

const dropdownItemStyles = {
  purple: 'text-white hover:bg-white/20',
  cyan: 'text-gray-900 hover:bg-white/40',
  mint: 'text-gray-900 hover:bg-white/40',
  yellow: 'text-gray-900 hover:bg-white/40',
  orange: 'text-white hover:bg-white/20',
  gold: 'text-gray-900 hover:bg-white/40',
  gray: 'text-white hover:bg-white/20',
  red: 'text-white hover:bg-white/20',
  white: 'text-gray-900 hover:bg-gray-100',
};

export function ActionButtonDropdown({
  label,
  items,
  icon,
  variant = 'purple',
  className = '',
  disabled = false,
  size = 'default',
}: ActionButtonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = size === 'compact'
    ? 'py-1.5 pl-3 pr-1.5 text-[13px]'
    : 'py-2 pl-4 pr-2 text-[14px]';
  const iconSize = size === 'compact' ? 'w-5 h-5' : 'w-8 h-8';

  const baseClasses = `w-full group inline-flex items-center font-bold ${sizeClasses} rounded-full transition-colors duration-300`;
  const variantClass = variantStyles[variant];
  const iconBgClass = iconBgStyles[variant];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Cancel leave timeout when entering the dropdown panel
  const handleDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        disabled={disabled}
        className={`${baseClasses} ${variantClass} ${disabledClass}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="relative z-10 flex-1 text-left transition-colors duration-300">
          {label}
        </span>
        {/* Chevron icon */}
        <span className={`relative z-10 ml-3 ${iconSize} flex items-center justify-center rounded-full transition-all duration-400 ${isOpen ? 'rotate-180' : ''} ${iconBgClass}`}>
          {icon || (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-1 rounded-2xl shadow-lg overflow-hidden z-50 animate-fade-in-up min-w-full w-max ${dropdownBgStyles[variant]}`}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left font-semibold text-[14px] transition-colors ${dropdownItemStyles[variant]} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {item.icon && (
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Dropdown-specific icons
export const DropdownIcons = {
  Play: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Game: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82.513.513 0 00-.479-.442 48.267 48.267 0 01-4.112-.29.649.649 0 00-.658.643v0" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
};
