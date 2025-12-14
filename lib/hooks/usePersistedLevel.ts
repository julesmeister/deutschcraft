/**
 * Hook for persisting and loading CEFR level selection from localStorage
 */

import { useState, useEffect } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';

export function usePersistedLevel(storageKey: string, defaultLevel: CEFRLevel = CEFRLevel.A1) {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(() => {
    // Load last selected level from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved && Object.values(CEFRLevel).includes(saved as CEFRLevel)) {
        return saved as CEFRLevel;
      }
    }
    return defaultLevel;
  });

  // Save selected level to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, selectedLevel);
  }, [selectedLevel, storageKey]);

  return [selectedLevel, setSelectedLevel] as const;
}
