'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  value: string;
  options: { value: string; label: string; color: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ value, options, onChange, placeholder = 'Select' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 cursor-pointer font-semibold text-gray-600 hover:text-gray-900"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6l6 -6" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[140px]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                value === option.value ? 'bg-gray-100' : ''
              }`}
            >
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100 ${option.color}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
