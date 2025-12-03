'use client';

import { createContext, useContext, ReactNode } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';
import { ToastVariant, ToastAction } from './Toast';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  actions?: ToastAction[];
  showIcon?: boolean;
}

interface ToastContextValue {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  confirm: (title: string, description: string, onConfirm: () => void, options?: Omit<ToastOptions, 'actions'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
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
    options?: Omit<ToastOptions, 'actions'>
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

  const value = {
    success,
    error,
    warning,
    info,
    confirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
