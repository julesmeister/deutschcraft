import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = `classroom-tools:${key}`;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== "undefined" ? localStorage.getItem(prefixedKey) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(prefixedKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [prefixedKey]
  );

  return [storedValue, setValue];
}
