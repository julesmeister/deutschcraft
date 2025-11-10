'use client';

import { ReactNode } from 'react';

export interface FileGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive grid container for file/folder cards
 * 1 column on mobile, 2 on small, 3 on large, 4 on 2xl screens
 */
export function FileGrid({ children, className = '' }: FileGridProps) {
  return (
    <div
      className={`sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 lg:gap-y-6 lg:gap-x-6 mt-4 grid grid-cols-1 gap-y-4 gap-x-4 ${className}`}
    >
      {children}
    </div>
  );
}
