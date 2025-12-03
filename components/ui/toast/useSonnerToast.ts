'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Sonner-based Toast Hook
 * Drop-in replacement for the old useToast hook
 * Maintains backward compatibility with existing API
 */

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  showIcon?: boolean;
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) => {
    if (options?.title || options?.description) {
      sonnerToast.success(options.title || message, {
        description: options.description || (options.title ? message : undefined),
        duration: options.duration,
      });
    } else {
      sonnerToast.success(message, {
        duration: options?.duration,
      });
    }
  };

  const error = (message: string, options?: ToastOptions) => {
    if (options?.title || options?.description) {
      sonnerToast.error(options.title || message, {
        description: options.description || (options.title ? message : undefined),
        duration: options?.duration,
      });
    } else {
      sonnerToast.error(message, {
        duration: options?.duration,
      });
    }
  };

  const warning = (message: string, options?: ToastOptions) => {
    if (options?.title || options?.description) {
      sonnerToast.warning(options.title || message, {
        description: options.description || (options.title ? message : undefined),
        duration: options?.duration,
      });
    } else {
      sonnerToast.warning(message, {
        duration: options?.duration,
      });
    }
  };

  const info = (message: string, options?: ToastOptions) => {
    if (options?.title || options?.description) {
      sonnerToast.info(options.title || message, {
        description: options.description || (options.title ? message : undefined),
        duration: options?.duration,
      });
    } else {
      sonnerToast.info(message, {
        duration: options?.duration,
      });
    }
  };

  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    options?: Omit<ToastOptions, 'title' | 'description'>
  ) => {
    sonnerToast(title, {
      description,
      duration: options?.duration ?? Infinity,
      action: {
        label: 'Confirm',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return {
    success,
    error,
    warning,
    info,
    confirm,
  };
}
