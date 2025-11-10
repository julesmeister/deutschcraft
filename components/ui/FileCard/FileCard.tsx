'use client';

import { ReactNode } from 'react';

export interface FileCardProps {
  icon: ReactNode;
  name: string;
  size: string;
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
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
}: FileCardProps) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between gap-y-2 gap-x-2 rounded-2xl border-solid border border-neutral-200 bg-white px-3.5 py-4 duration-150 ease-in-out hover:shadow-sm ${className}`}
      role="button"
      onClick={onClick}
    >
      <div className="flex items-center gap-y-2 gap-x-2">
        <div className="text-3xl leading-tight">{icon}</div>
        <div>
          <div className="text-neutral-900 font-bold">{name}</div>
          <span className="text-xs leading-snug text-neutral-500">{size}</span>
        </div>
      </div>
      {onMenuClick && (
        <div role="menuitem" aria-expanded="false" aria-haspopup="menu">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick();
            }}
            className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:[scale:0.98] inline-flex h-8 w-8 items-center justify-center rounded-[3.40282e38px] text-base leading-normal hover:text-blue-500"
          >
            <svg
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 fill-none stroke-current"
            >
              <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
              <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
              <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
