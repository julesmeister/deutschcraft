'use client';

import { ReactNode } from 'react';

interface ActivityCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  shadow?: boolean;
  className?: string;
}

export function ActivityCard({
  children,
  title,
  subtitle,
  actions,
  shadow = false,
  className = '',
}: ActivityCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl ${
        shadow ? 'border-b border-neutral-200 shadow-sm' : 'border border-neutral-200'
      } ${className}`}
    >
      {/* Header (optional) */}
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            {title && (
              <h5 className="text-neutral-900 text-lg font-bold">
                {title}
              </h5>
            )}
            {subtitle && (
              <p className="text-neutral-500 text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
