"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseClassroomToolStateOptions {
  roomId: string;
  userRole: "teacher" | "student";
  currentUserId: string;
}

interface ToolStateBlob {
  [key: string]: unknown;
}

/**
 * Shared classroom tool state hook.
 * Teachers write to API on change (debounced 300ms).
 * Students poll every 2s for updates.
 *
 * Usage: const [value, setValue] = useToolValue<T>(key, defaultValue)
 * where key is a tool-specific key like "dice-values", "timer-mode", etc.
 */
export function useClassroomToolState({ roomId, userRole, currentUserId }: UseClassroomToolStateOptions) {
  const [state, setState] = useState<ToolStateBlob>({});
  const stateRef = useRef<ToolStateBlob>({});
  const lastUpdatedAtRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTeacher = userRole === "teacher";
  const mountedRef = useRef(true);

  // Keep ref in sync
  stateRef.current = state;

  // Fetch initial state on mount
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function fetchInitial() {
      try {
        const res = await fetch(`/api/classroom-tools/${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.state && Object.keys(data.state).length > 0) {
          setState(data.state);
          stateRef.current = data.state;
          lastUpdatedAtRef.current = data.updatedAt || 0;
        }
      } catch {
        // Silently fail on initial fetch
      }
    }

    fetchInitial();
    return () => { cancelled = true; mountedRef.current = false; };
  }, [roomId]);

  // Student: poll every 2s
  useEffect(() => {
    if (isTeacher) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/classroom-tools/${roomId}?since=${lastUpdatedAtRef.current}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.changed && data.state) {
          setState(data.state);
          stateRef.current = data.state;
          lastUpdatedAtRef.current = data.updatedAt;
        }
      } catch {
        // Silently fail on poll
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, isTeacher]);

  // Teacher: write to API (debounced)
  const persistState = useCallback((newState: ToolStateBlob) => {
    if (!isTeacher) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/classroom-tools/${roomId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: newState, updatedBy: currentUserId }),
        });
        lastUpdatedAtRef.current = Date.now();
      } catch {
        // Silently fail on persist
      }
    }, 300);
  }, [roomId, isTeacher, currentUserId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /**
   * Get/set a specific tool key within the shared state blob.
   * Returns [value, setValue] similar to useState.
   */
  function useToolValue<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const current = (state[key] as T) ?? defaultValue;

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const prevVal = (prev[key] as T) ?? defaultValue;
        const next = value instanceof Function ? value(prevVal) : value;
        const newState = { ...prev, [key]: next };
        stateRef.current = newState;
        persistState(newState);
        return newState;
      });
    }, [key, defaultValue]);

    return [current, setValue];
  }

  return { useToolValue, isTeacher };
}

export type ClassroomToolContext = ReturnType<typeof useClassroomToolState>;
