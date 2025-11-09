'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

interface DropdownColumn {
  title: string;
  items: DropdownItem[];
}

interface HighlightSection {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  image?: string;
}

interface MegaDropdownProps {
  trigger: string;
  highlight?: HighlightSection;
  columns: DropdownColumn[];
  icon?: string;
  onNavigate?: () => void;
}

export function MegaDropdown({ trigger, highlight, columns, icon, onNavigate }: MegaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-semibold text-[15px] text-gray-300 hover:text-piku-cyan-accent transition-all duration-300 relative flex items-center gap-2 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
      >
        {trigger}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 bg-white shadow-2xl border border-gray-100 rounded-3xl z-50 w-[1000px] animate-fade-in-down overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-12 gap-16">
              {/* Highlight Section (if provided) */}
              {highlight && (
                <div className="col-span-5">
                  <div className="border border-gray-100 rounded-2xl p-8 h-full flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white">
                    <div>
                      <div className="inline-flex items-center gap-2.5 bg-white border border-gray-100 px-4 py-2 rounded-full text-xs font-medium text-gray-900 mb-5 shadow-sm">
                        {icon && <span className="text-base">{icon}</span>}
                        {highlight.badge}
                      </div>
                      <h5 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                        {highlight.title}
                      </h5>
                      <p className="text-sm font-normal text-gray-600 mb-8 leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                    <Link
                      href={highlight.buttonHref}
                      onClick={() => onNavigate?.()}
                      className="inline-block bg-piku-purple-dark text-white text-sm font-semibold px-7 py-3 rounded-xl hover:bg-piku-cyan-accent hover:text-gray-900 transition-colors duration-300 text-center shadow-sm"
                    >
                      {highlight.buttonText}
                    </Link>
                  </div>
                </div>
              )}

              {/* Columns */}
              <div className={highlight ? 'col-span-7' : 'col-span-12'}>
                <div className="grid grid-cols-3 gap-10">
                  {columns.map((column, idx) => (
                    <div key={idx} className="space-y-4">
                      <h6 className="text-xs font-semibold text-gray-500 uppercase mb-5 tracking-wider border-b border-gray-100 pb-3">
                        {column.title}
                      </h6>
                      <ul className="space-y-1">
                        {column.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={item.href}
                              target={item.external ? '_blank' : undefined}
                              rel={item.external ? 'noopener noreferrer' : undefined}
                              className="group flex items-center justify-between gap-3 py-3 px-4 rounded-xl text-sm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                            >
                              <span className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                              <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                              </svg>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
