'use client';

import { useEffect, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-white',
    borderColor: 'border-emerald-200',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-white',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bgColor: 'bg-white',
    borderColor: 'border-amber-200',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    bgColor: 'bg-white',
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
}: ToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const hasActions = actions && actions.length > 0;
  const hasTitle = title || description;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Action toast with title/description/buttons
  if (hasTitle || hasActions) {
    return (
      <div
        className={`text-neutral-500 text-sm font-semibold leading-snug flex px-6 py-5 ${config.bgColor} border border-neutral-200 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in-right`}
        role="alert"
        aria-live="polite"
      >
        <div className="mr-4 flex-1">
          {/* Title */}
          {title && (
            <div className="text-neutral-800 text-base font-bold leading-normal mb-2">
              {title}
            </div>
          )}

          {/* Description or message */}
          <div className="text-neutral-500 font-normal">
            {description || message}
          </div>

          {/* Action buttons */}
          {hasActions && (
            <div className="mt-3 text-right space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose(id);
                  }}
                  className={`cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:scale-[0.98] h-10 rounded-xl px-3 py-2 text-sm leading-snug ${
                    action.variant === 'primary'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'border-solid border border-neutral-300 bg-white text-neutral-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-sm'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(id)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors self-start"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // Simple toast with icon and message
  return (
    <div
      className={`text-neutral-500 text-sm font-semibold leading-snug flex px-6 py-5 ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {showIcon && (
        <div className="mt-0.5 mr-3">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
      )}

      {/* Message */}
      <div className="mr-4 flex-1">
        <div className="mt-1 text-neutral-900">{message}</div>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="text-neutral-400 hover:text-neutral-600 transition-colors ml-2"
        aria-label="Close notification"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
