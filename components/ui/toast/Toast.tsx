'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ToastProps {
  id: string;
  message: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
  actions?: ToastAction[];
  showIcon?: boolean;
  timestamp?: string;
}

const variantConfig = {
  success: {
    iconBg: 'bg-emerald-500',
    borderColor: 'border-emerald-200',
  },
  error: {
    iconBg: 'bg-red-500',
    borderColor: 'border-red-200',
  },
  warning: {
    iconBg: 'bg-amber-500',
    borderColor: 'border-amber-200',
  },
  info: {
    iconBg: 'bg-blue-500',
    borderColor: 'border-blue-200',
  },
} as const;

export function Toast({
  id,
  message,
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
  actions,
  showIcon = true,
  timestamp,
}: ToastProps) {
  const config = variantConfig[variant];
  const hasActions = actions && actions.length > 0;
  const hasTitle = !!title;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Format timestamp - default to "just now" if not provided
  const displayTime = timestamp || 'just now';

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm border ${config.borderColor} rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Toast Header */}
      <div className="flex items-center px-3 py-2 border-b border-neutral-200/60 bg-white/90 rounded-t-lg">
        {/* Icon Square */}
        {showIcon && (
          <svg
            className="rounded mr-2"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            role="img"
            aria-label={`${variant} icon`}
          >
            <rect width="100%" height="100%" className={config.iconBg} fill="currentColor" />
          </svg>
        )}

        {/* Title */}
        <div className="font-bold text-neutral-800 text-sm mr-auto">
          {title || 'DeutschCraft'}
        </div>

        {/* Timestamp */}
        <small className="text-neutral-500 text-xs mr-2">
          {displayTime}
        </small>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose(id)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Toast Body */}
      <div className="px-3 py-2 text-neutral-700 text-sm break-words">
        {description || message}

        {/* Action buttons */}
        {hasActions && (
          <div className="mt-3 flex gap-2 justify-end">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose(id);
                }}
                className={`cursor-pointer whitespace-nowrap font-semibold transition-all duration-150 ease-in-out active:scale-[0.98] rounded-lg px-3 py-1.5 text-xs ${
                  action.variant === 'primary'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'border border-neutral-300 bg-white text-neutral-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-sm'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
