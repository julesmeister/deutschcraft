'use client';

import { useState, useRef, useEffect, ReactNode, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  color?: string; // For badge/label colors
}

export interface DropdownGroup {
  title: string;
  icon?: string;
  options: DropdownOption[];
}

interface CompactButtonDropdownProps {
  /** Button text */
  label: string;
  /** Icon on the left side of button (emoji or SVG) */
  icon?: ReactNode;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Enable search functionality */
  searchable?: boolean;
  /** Grouped options with headers */
  groups?: DropdownGroup[];
  /** Flat list of options (use this OR groups) */
  options?: DropdownOption[];
  /** Currently selected value(s) */
  value?: string | string[];
  /** Multiple selection mode */
  multiple?: boolean;
  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void;
  /** Custom button styles */
  buttonClassName?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Use portal to prevent clipping by parent containers */
  usePortal?: boolean;
}

const CompactButtonDropdownComponent = ({
  label,
  icon,
  searchPlaceholder = 'Search...',
  searchable = false,
  groups,
  options,
  value,
  multiple = false,
  onChange,
  buttonClassName = '',
  disabled = false,
  usePortal = false,
}: CompactButtonDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update position when opened (for portal)
  useEffect(() => {
    if (isOpen && usePortal && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen, usePortal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = usePortal ? menuRef.current : buttonRef.current?.parentElement;
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, usePortal]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click in tables
    if (!disabled) {
      setIsOpen(prev => !prev);
      setSearchQuery('');
    }
  }, [disabled]);

  const handleSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  }, [multiple, value, onChange]);

  const isSelected = useCallback((optionValue: string) => {
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  }, [value]);

  // Filter options based on search - memoized
  const filterOptions = useCallback((opts: DropdownOption[]) => {
    if (!searchQuery) return opts;
    const query = searchQuery.toLowerCase();
    return opts.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [searchQuery]);

  const renderOptions = () => {
    if (groups) {
      return groups.map((group, idx) => {
        const filteredOptions = filterOptions(group.options);
        if (filteredOptions.length === 0) return null;

        return (
          <div key={idx}>
            {idx > 0 && <div className="border-t border-gray-200 my-1" />}
            <div className="uppercase text-[10px] font-bold text-gray-700 px-2.5 py-1.5 mt-1">
              {group.icon && <span className="mr-1">{group.icon}</span>}
              {group.title}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-1.5 hover:bg-gray-100 transition-colors ${
                    isSelected(option.value) ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="whitespace-nowrap">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      });
    }

    if (options) {
      const filteredOptions = filterOptions(options);
      return (
        <div className="max-h-48 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-1.5 hover:bg-gray-100 transition-colors ${
                isSelected(option.value) ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span className="whitespace-nowrap">{option.label}</span>
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  // Memoize dropdown menu to prevent unnecessary re-renders
  const dropdownMenu = useMemo(() => !isOpen ? null : (
    <div
      ref={menuRef}
      className={`min-w-max bg-white rounded shadow-lg border border-gray-200 overflow-hidden ${usePortal ? 'fixed z-[9999]' : 'absolute left-0 mt-2 z-50'}`}
      style={usePortal ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      {searchable && (
        <>
          <div className="relative p-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 pr-8 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="border-t border-gray-200" />
        </>
      )}

      {/* Options */}
      {renderOptions()}
    </div>
  ), [isOpen, usePortal, position, searchable, searchQuery, renderOptions]);

  return (
    <div className="relative inline-block">
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
          bg-gray-200 text-gray-700 rounded border-none cursor-pointer
          hover:bg-gray-300 hover:text-gray-900
          active:bg-gray-300 active:shadow-inner
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          transition-all duration-100
          ${buttonClassName}
        `}
        type="button"
      >
        {icon && (
          <span className="flex items-center justify-center -ml-1">
            {icon}
          </span>
        )}
        <span>{label}</span>
        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {usePortal && isOpen ? createPortal(dropdownMenu, document.body) : dropdownMenu}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const CompactButtonDropdown = memo(CompactButtonDropdownComponent);

/**
 * Badge component for colored labels (like tags)
 */
export function DropdownBadge({ color, size = 'sm' }: { color: string; size?: 'xs' | 'sm' }) {
  const sizeClasses = size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return (
    <div
      className={`inline-block ${sizeClasses} rounded-full`}
      style={{ backgroundColor: color }}
    />
  );
}
