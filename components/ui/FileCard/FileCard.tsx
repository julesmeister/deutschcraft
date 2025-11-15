'use client';

import { ReactNode } from 'react';

export interface FileCardProps {
  icon: ReactNode;
  name: string;
  size: string;
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
  isAttempted?: boolean;
  attemptCount?: number;
}

/**
 * A card component for displaying files or folders
 * Features icon, name, size, and optional menu button
 */
export function FileCard({
  icon,
  name,
  size,
  onClick,
  onMenuClick,
  className = '',
  isAttempted = false,
  attemptCount,
}: FileCardProps) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border-solid border px-3 py-3 sm:px-3.5 sm:py-4 duration-150 ease-in-out hover:shadow-sm active:scale-[0.98] ${
        isAttempted
          ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
          : 'bg-white border-neutral-200'
      } ${className}`}
      role="button"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="text-2xl sm:text-3xl leading-tight shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-neutral-900 font-bold text-sm sm:text-base truncate">{name}</div>
          <span className="text-xs leading-snug text-neutral-500">{size}</span>
        </div>
      </div>
      {attemptCount !== undefined && attemptCount > 0 && (
        <div className="flex items-center gap-1 sm:gap-1.5 bg-blue-100 text-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shrink-0">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold">{attemptCount}</span>
        </div>
      )}
    </div>
  );
}
