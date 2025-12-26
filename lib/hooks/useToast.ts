/**
 * Toast notification hook
 * Provides a simple interface to show toast notifications
 */

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastCounter = 0;

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    // Create a unique toast ID
    const id = `toast-${Date.now()}-${toastCounter++}`;

    // Create toast element
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = getToastClasses(type);
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        ${getToastIcon(type)}
        <span class="text-sm font-medium">${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
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
  container.className = 'fixed top-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

function getToastClasses(type: ToastType): string {
  const baseClasses = 'px-4 py-3 rounded-lg shadow-lg transition-all duration-300 opacity-0 transform -translate-y-2 flex items-center gap-2 min-w-[250px]';

  const typeClasses = {
    success: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-amber-50 border border-amber-200 text-amber-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
  };

  return `${baseClasses} ${typeClasses[type]}`;
}

function getToastIcon(type: ToastType): string {
  const icons = {
    success: '<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    info: '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  return icons[type];
}
