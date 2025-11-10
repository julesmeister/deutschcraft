'use client';

import { ReactNode } from 'react';

export interface FileSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Section container with title and content
 * Used to group files or folders under a heading
 */
export function FileSection({ title, children, className = '' }: FileSectionProps) {
  return (
    <div className={className}>
      <h4 className="text-neutral-900 text-xl font-bold leading-snug">{title}</h4>
      <div className="mt-4">{children}</div>
    </div>
  );
}
