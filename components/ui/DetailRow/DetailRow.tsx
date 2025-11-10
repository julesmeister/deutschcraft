'use client';

import { ReactNode } from 'react';

interface DetailRowProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A single detail row with icon, label, and value
 * Used for displaying key-value pairs in a clean format
 */
export function DetailRow({ icon, label, children, className = '' }: DetailRowProps) {
  return (
    <div className={`mb-2 flex items-center ${className}`}>
      {/* Label */}
      <div className="flex min-w-36 items-center gap-x-2 gap-y-2 font-semibold text-neutral-900">
        {icon && (
          <span className="text-lg leading-normal">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>

      {/* Value */}
      <div className="flex min-h-12 items-center rounded-xl px-3">
        {children}
      </div>
    </div>
  );
}
