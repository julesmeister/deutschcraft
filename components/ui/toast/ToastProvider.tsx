/**
 * ToastProvider - Simple wrapper for custom toast
 * No context needed since toast uses portals
 */

'use client';

import { ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  // The custom toast system uses portals and doesn't need a provider
  // This component exists for backwards compatibility
  return <>{children}</>;
}
