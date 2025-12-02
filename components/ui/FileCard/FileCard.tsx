'use client';

import { ReactNode } from 'react';

export interface FileCardProps {
  icon: ReactNode;
  name: string;
  size: string;
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
  completionStatus?: 'completed' | 'in-progress' | 'not-started';
  attemptCount?: number;
  dueCount?: number;
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
  completionStatus = 'not-started',
  attemptCount,
  dueCount,
}: FileCardProps) {
  // Determine background and border colors based on completion status
  const statusStyles = {
    'completed': 'bg-green-50 border-green-200 hover:border-green-300',
    'in-progress': 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
    'not-started': 'bg-white border-neutral-200',
  };

  // Determine badge colors based on completion status
  const badgeStyles = {
    'completed': 'bg-green-100 text-green-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    'not-started': 'bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={`relative flex cursor-pointer items-center justify-between gap-2 rounded-2xl border-solid border px-3 py-3 sm:px-3.5 sm:py-4 duration-150 ease-in-out hover:shadow-sm active:scale-[0.98] ${
        statusStyles[completionStatus]
      } ${className}`}
      role="button"
      onClick={onClick}
    >
      {/* Due Count Badge - Top Right Absolute */}
      {dueCount !== undefined && dueCount > 0 && (
        <div
          className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md border-2 border-white group/badge"
          title={`${dueCount} card${dueCount !== 1 ? 's' : ''} due today`}
        >
          {dueCount}
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover/badge:block pointer-events-none z-50">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {dueCount} card{dueCount !== 1 ? 's' : ''} due today
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="text-2xl sm:text-3xl leading-tight shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-neutral-900 font-bold text-sm sm:text-base truncate">{name}</div>
          <span className="text-xs leading-snug text-neutral-500">{size}</span>
        </div>
      </div>
      {attemptCount !== undefined && attemptCount > 0 && (
        <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shrink-0 ${badgeStyles[completionStatus]}`}>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold">{attemptCount}</span>
        </div>
      )}
    </div>
  );
}
