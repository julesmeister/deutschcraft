/**
 * Hook for Der Die Das ending progress persistence
 * Loads previous correct counts and saves new ones to Turso
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";
import {
  saveDerDieDasCorrect,
  getDerDieDasProgress,
} from "@/lib/services/turso/derDieDasService";

export function useDerDieDasProgress() {
  const { session } = useFirebaseAuth();
  const userId = session?.user?.email || null;
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingSaves = useRef<Promise<void>[]>([]);

  // Load existing progress on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getDerDieDasProgress(userId)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const row of rows) {
          map[row.ending] = row.correctCount;
        }
        setProgressMap(map);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("[useDerDieDasProgress] Failed to load:", err);
        setIsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [userId]);

  // Save a correct answer (fire-and-forget, update local state immediately)
  const recordCorrect = useCallback(
    (entry: { ending: string; article: string }) => {
      // Optimistic local update
      setProgressMap((prev) => ({
        ...prev,
        [entry.ending]: (prev[entry.ending] || 0) + 1,
      }));

      if (!userId) return;

      // Background save
      const p = saveDerDieDasCorrect(userId, entry)
        .then((newCount) => {
          setProgressMap((prev) => ({ ...prev, [entry.ending]: newCount }));
        })
        .catch((err) => {
          console.error("[useDerDieDasProgress] Failed to save:", err);
        });

      pendingSaves.current.push(p as unknown as Promise<void>);
    },
    [userId]
  );

  const getCount = useCallback(
    (ending: string) => progressMap[ending] || 0,
    [progressMap]
  );

  return { progressMap, isLoaded, recordCorrect, getCount };
}
