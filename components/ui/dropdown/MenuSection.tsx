'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MenuSectionProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function MenuSection({
  icon,
  title,
  children,
  defaultOpen = false,
  className = '',
}: MenuSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = icon as LucideIcon;

  return (
    <div className={className}>
      {/* Section header (clickable) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-neutral-600 select-none justify-between items-center h-12 font-semibold transition-all duration-200 ease-in-out flex px-3 rounded-lg hover:text-neutral-900 hover:bg-neutral-100"
        role="button"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-2xl leading-snug">
                {typeof Icon === 'function' ? (
                  <Icon className="h-6 w-6" />
                ) : (
                  icon
                )}
              </span>
            )}
            <span>{title}</span>
          </div>
        </span>
        <span
          className={`mt-1 text-lg leading-normal transition-transform duration-200 ${
            isOpen ? '-rotate-180' : ''
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>

      {/* Collapsible content */}
      <ul
        className={`ml-8 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </ul>
    </div>
  );
}
