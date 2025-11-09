'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MenuItemProps {
  icon?: LucideIcon | ReactNode;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function MenuItem({
  icon,
  children,
  onClick,
  active = false,
  disabled = false,
  className = '',
  compact = false,
}: MenuItemProps) {
  const Icon = icon as LucideIcon;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        cursor-pointer whitespace-nowrap text-neutral-600 items-center w-full
        transition-all duration-150 ease-in-out flex rounded-lg
        ${compact ? 'px-2.5 py-1.5 text-xs font-medium gap-x-1.5' : 'px-3 h-12 font-semibold gap-x-2'}
        ${active ? 'text-neutral-900 bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      role="menuitem"
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className={compact ? 'text-sm leading-none' : 'text-2xl leading-snug'}>
            {typeof Icon === 'function' ? (
              <Icon className={compact ? 'h-3.5 w-3.5' : 'h-6 w-6'} />
            ) : (
              icon
            )}
          </span>
        )}
        <span>{children}</span>
      </div>
    </div>
  );
}
