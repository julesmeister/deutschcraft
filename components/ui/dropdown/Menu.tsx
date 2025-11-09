'use client';

import { ReactNode } from 'react';

interface MenuProps {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function Menu({ children, className = '', compact = false }: MenuProps) {
  return (
    <div
      className={`text-neutral-500 font-medium leading-snug rounded-md border-solid border border-neutral-200 ${
        compact ? 'p-0.5 text-xs' : 'p-2 text-sm'
      } max-w-64 ${className}`}
    >
      <nav>{children}</nav>
    </div>
  );
}
