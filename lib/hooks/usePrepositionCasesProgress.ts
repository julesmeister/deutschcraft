/**
 * Hook for Preposition Cases progress persistence
 * Loads previous correct counts and saves new ones to Turso
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";
import {
  savePrepositionCaseCorrect,
  getPrepositionCasesProgress,
} from "@/lib/services/turso/prepositionCasesService";

export function usePrepositionCasesProgress() {
  const { session } = useFirebaseAuth();
  const userId = session?.user?.email || null;
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingSaves = useRef<Promise<void>[]>([]);

  // Load existing progress on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getPrepositionCasesProgress(userId)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const row of rows) {
          map[row.preposition] = row.correctCount;
        }
        setProgressMap(map);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("[usePrepositionCasesProgress] Failed to load:", err);
        setIsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [userId]);

  // Save a correct answer (fire-and-forget, update local state immediately)
  const recordCorrect = useCallback(
    (entry: { german: string; case: string }) => {
      // Optimistic local update
      setProgressMap((prev) => ({
        ...prev,
        [entry.german]: (prev[entry.german] || 0) + 1,
      }));

      if (!userId) return;

      // Background save
      const p = savePrepositionCaseCorrect(userId, entry)
        .then((newCount) => {
          setProgressMap((prev) => ({ ...prev, [entry.german]: newCount }));
        })
        .catch((err) => {
          console.error("[usePrepositionCasesProgress] Failed to save:", err);
        });

      pendingSaves.current.push(p as unknown as Promise<void>);
    },
    [userId]
  );

  const getCount = useCallback(
    (german: string) => progressMap[german] || 0,
    [progressMap]
  );

  return { progressMap, isLoaded, recordCorrect, getCount };
}
