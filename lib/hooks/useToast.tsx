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
const activeToasts = new Set<string>();

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

    // Track active toasts
    activeToasts.add(id);
    updateCloseAllButton();

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
          activeToasts.delete(id);
          updateCloseAllButton();
        } catch (e) {
          // Already unmounted
        }
      }, 300);
    };

    // Render Toast component using React
    const root = createRoot(toastWrapper);

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

    // Auto-close logic handled by the hook itself to ensure cleanup
    // Set timer AFTER render to ensure proper cleanup
    if (duration > 0) {
      setTimeout(() => {
        handleClose();
      }, duration);
    }
  }, []);

  // Convenience methods
  const success = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'success', duration ?? 3000, title);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'error', duration ?? 3000, title);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'warning', duration ?? 3000, title);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number, title?: string) => {
    showToast(message, 'info', duration ?? 3000, title);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
}

function closeAllToasts() {
  const toastIds = Array.from(activeToasts);
  toastIds.forEach(id => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      // Trigger close button click
      const closeButton = toastElement.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  });
}

function updateCloseAllButton() {
  const container = document.getElementById('toast-container');
  if (!container) return;

  let closeAllBtn = document.getElementById('toast-close-all-btn');

  if (activeToasts.size >= 2) {
    if (!closeAllBtn) {
      closeAllBtn = document.createElement('button');
      closeAllBtn.id = 'toast-close-all-btn';
      closeAllBtn.className = 'toast-close-all';
      closeAllBtn.innerHTML = 'Close All';
      closeAllBtn.onclick = closeAllToasts;
      container.insertBefore(closeAllBtn, container.firstChild);
    }
    closeAllBtn.style.display = 'block';
  } else {
    if (closeAllBtn) {
      closeAllBtn.style.display = 'none';
    }
  }
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
  container.style.cssText = `
    pointer-events: none;
  `;
  document.body.appendChild(container);

  // Add global styles for toast items and close all button
  const style = document.createElement('style');
  style.textContent = `
    .toast-item {
      pointer-events: auto;
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: translateX(20px);
    }
    .toast-close-all {
      pointer-events: auto;
      display: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
      margin-bottom: 8px;
      width: 100%;
      text-align: center;
    }
    .toast-close-all:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }
    .toast-close-all:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  return container;
}
