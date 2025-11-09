'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Control */}
      <div
        className={`min-h-12 bg-gray-100 rounded-xl border border-gray-200 transition-all duration-150 flex justify-between items-center cursor-pointer ${
          isOpen ? 'ring-2 ring-piku-purple border-piku-purple' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
      >
        {/* Value Container */}
        <div className="flex-1 px-3 py-2 grid items-center gap-2 flex-wrap relative overflow-hidden">
          {/* Placeholder or Selected Value */}
          {!isOpen && !selectedOption && (
            <div className="text-gray-400 font-semibold col-start-1 row-start-1">
              {placeholder}
            </div>
          )}

          {!isOpen && selectedOption && (
            <div className="text-gray-800 font-semibold col-start-1 row-start-1">
              {selectedOption.label}
            </div>
          )}

          {/* Input Container (shown when open) */}
          {isOpen && (
            <div className="visible text-gray-800 font-semibold flex-auto inline-grid col-start-1 row-start-1">
              <input
                ref={inputRef}
                className="w-full bg-transparent outline-none border-0 font-semibold text-gray-800"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {/* Indicators Container */}
        <div className="px-3 text-2xl">
          <div className="text-gray-500">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 20 20"
              aria-hidden="true"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors font-semibold ${
                  value === option.value ? 'bg-piku-purple-light text-piku-purple' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
