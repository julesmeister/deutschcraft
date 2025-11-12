'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Toast, ToastVariant, ToastAction } from './Toast';

interface ToastItem {
  id: string;
  message: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  actions?: ToastAction[];
  showIcon?: boolean;
}

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  actions?: ToastAction[];
  showIcon?: boolean;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  confirm: (title: string, description: string, onConfirm: () => void, options?: Omit<ToastOptions, 'actions'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, variant: ToastVariant = 'info', options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        variant,
        duration: options.duration ?? 5000,
        title: options.title,
        description: options.description,
        actions: options.actions,
        showIcon: options.showIcon,
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Convenience methods
  const success = (message: string, options?: ToastOptions) => addToast(message, 'success', options);

  const error = (message: string, options?: ToastOptions) => addToast(message, 'error', options);

  const warning = (message: string, options?: ToastOptions) => addToast(message, 'warning', options);

  const info = (message: string, options?: ToastOptions) => addToast(message, 'info', options);

  // Confirm toast with action buttons
  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    options: Omit<ToastOptions, 'actions'> = {}
  ) => {
    addToast('', 'info', {
      ...options,
      title,
      description,
      duration: 0, // Don't auto-dismiss confirm toasts
      actions: [
        {
          label: 'Confirm',
          onClick: onConfirm,
          variant: 'primary',
        },
        {
          label: 'Close',
          onClick: () => {},
          variant: 'secondary',
        },
      ],
    });
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    confirm,
  };

  return (
    <ToastContext value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            duration={toast.duration}
            onClose={removeToast}
            actions={toast.actions}
            showIcon={toast.showIcon}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
