'use client';

import { ReactNode } from 'react';

interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

/**
 * Grid container for detail rows
 * Supports 1 or 2 column layout (responsive on xl screens)
 */
export function DetailGrid({ children, columns = 2, className = '' }: DetailGridProps) {
  const gridClass = columns === 2 ? 'xl:grid-cols-2 grid grid-cols-1' : 'grid grid-cols-1';

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}
