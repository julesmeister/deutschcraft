'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center ${className}`}>
      {icon && (
        <div className="mb-4">
          {typeof icon === 'string' ? (
            <div className="text-6xl">{icon}</div>
          ) : (
            icon
          )}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
