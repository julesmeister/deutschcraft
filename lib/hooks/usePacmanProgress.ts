/**
 * Hook for Pacman verb progress persistence
 * Loads previous correct counts and saves new ones to Turso
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";
import {
  savePacmanVerbCorrect,
  getPacmanVerbProgress,
  PacmanVerbProgress,
} from "@/lib/services/turso/pacmanService";

export function usePacmanProgress() {
  const { session } = useFirebaseAuth();
  const userId = session?.user?.email || null;
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingSaves = useRef<Promise<void>[]>([]);

  // Load existing progress on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getPacmanVerbProgress(userId)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const row of rows) {
          map[row.verbFull] = row.correctCount;
        }
        setProgressMap(map);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("[usePacmanProgress] Failed to load:", err);
        setIsLoaded(true); // Don't block game
      });

    return () => { cancelled = true; };
  }, [userId]);

  // Save a correct answer (fire-and-forget, update local state immediately)
  const recordCorrect = useCallback(
    (verb: { full: string; root: string; prefix: string; meaning: string }) => {
      // Optimistic local update
      setProgressMap((prev) => ({
        ...prev,
        [verb.full]: (prev[verb.full] || 0) + 1,
      }));

      if (!userId) return;

      // Background save
      const p = savePacmanVerbCorrect(userId, verb)
        .then((newCount) => {
          setProgressMap((prev) => ({ ...prev, [verb.full]: newCount }));
        })
        .catch((err) => {
          console.error("[usePacmanProgress] Failed to save:", err);
        });

      pendingSaves.current.push(p as unknown as Promise<void>);
    },
    [userId]
  );

  const getCount = useCallback(
    (verbFull: string) => progressMap[verbFull] || 0,
    [progressMap]
  );

  return { progressMap, isLoaded, recordCorrect, getCount };
}
