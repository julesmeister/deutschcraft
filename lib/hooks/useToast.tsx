/**
 * Toast notification hook using React portals
 * Provides a simple interface to show toast notifications
 */

'use client';

import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast, ToastVariant } from '@/components/ui/toast/Toast';

export type ToastType = ToastVariant;

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastCounter = 0;

export function useToast() {
  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000,
    title?: string
  ) => {
    // Create a unique toast ID
    const id = `toast-${Date.now()}-${toastCounter++}`;

    // Get or create toast container
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    // Create a wrapper div for this specific toast
    const toastWrapper = document.createElement('div');
    toastWrapper.id = id;
    toastWrapper.className = 'toast-item';
    toastContainer.appendChild(toastWrapper);

    // Calculate relative time for timestamp
    const timestamp = 'just now';

    // Handle close
    const handleClose = () => {
      // Fade out animation
      toastWrapper.style.opacity = '0';
      toastWrapper.style.transform = 'translateX(20px)';
      setTimeout(() => {
        try {
          root.unmount();
          toastWrapper.remove();
        } catch (e) {
          // Already unmounted
        }
      }, 300);
    };

    // Render Toast component using React
    const root = createRoot(toastWrapper);
    
    // Auto-close logic handled by the hook itself to ensure cleanup
    if (duration > 0) {
      setTimeout(() => {
        handleClose();
      }, duration);
    }

    root.render(
      <Toast
        id={id}
        message={message}
        title={title}
        variant={type}
        duration={0} // Disable internal timer since we handle it here
        onClose={handleClose}
        timestamp={timestamp}
        showIcon={true}
      />
    );

    // Add fade-in animation
    setTimeout(() => {
      toastWrapper.style.opacity = '1';
      toastWrapper.style.transform = 'translateX(0)';
    }, 10);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'success', duration, title);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'error', duration, title);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'warning', duration, title);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'info', duration, title);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
  container.style.cssText = `
    pointer-events: none;
  `;
  document.body.appendChild(container);

  // Add global styles for toast items
  const style = document.createElement('style');
  style.textContent = `
    .toast-item {
      pointer-events: auto;
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: translateX(20px);
    }
  `;
  document.head.appendChild(style);

  return container;
}
