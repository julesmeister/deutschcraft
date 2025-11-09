'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-[400px]',
  md: 'w-[520px]',
  lg: 'w-[640px]',
  xl: 'w-[800px]',
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      // Save currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus dialog
      dialogRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousActiveElement.current?.focus();

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  if (!open) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-16 sm:pt-32">
        <div
          ref={dialogRef}
          className={`text-neutral-500 text-sm font-medium leading-snug outline-0 mx-auto ${sizeClasses[size]} mb-16 ${className}`}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sm:mx-0 sm:my-0 bg-white h-full relative shadow-2xl mx-4 pt-6 rounded-2xl animate-fade-in-up">
            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="cursor-pointer transition-all duration-150 ease-in-out active:scale-[0.98] bg-neutral-100 text-lg leading-normal p-1.5 rounded-full hover:text-neutral-800 hover:bg-neutral-200 absolute top-5 z-10 right-6"
                type="button"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Content */}
            <div className="px-6 pb-6">
              {title && (
                <h5
                  id="dialog-title"
                  className="text-neutral-900 text-lg font-bold leading-normal mb-4"
                >
                  {title}
                </h5>
              )}
              <div className="text-neutral-700">{children}</div>
            </div>

            {/* Footer */}
            {footer && (
              <div className="rounded-br-2xl rounded-bl-2xl bg-neutral-100 px-6 py-3 text-right">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at document root
  return typeof document !== 'undefined'
    ? createPortal(dialogContent, document.body)
    : null;
}

// Common footer patterns as helper components
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}

export function DialogButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  const variantClasses = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed',
    secondary:
      'border-solid border border-neutral-300 bg-white text-neutral-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
      'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:scale-[0.98] h-12 rounded-xl px-5 py-2 ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

// Preset dialog variants
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <DialogFooter>
          <DialogButton variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </DialogButton>
          <DialogButton variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Loading...' : confirmText}
          </DialogButton>
        </DialogFooter>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}

export function AlertDialog({
  open,
  onClose,
  title = 'Alert',
  message,
  buttonText = 'Okay',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <DialogFooter>
          <DialogButton variant="primary" onClick={onClose}>
            {buttonText}
          </DialogButton>
        </DialogFooter>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}
