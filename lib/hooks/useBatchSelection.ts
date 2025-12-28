/**
 * Custom hook for reusable batch selection logic with history
 * Persists selection to database (User preferences)
 */

import { useState, useEffect } from "react";
import { Batch, User } from "../models";
import { updateDashboardSettings } from "../services/user";

interface UseBatchSelectionProps {
  batches: Batch[];
  user?: User | null; // Current user to save preferences for
}

export function useBatchSelection({ batches, user }: UseBatchSelectionProps) {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [recentBatchIds, setRecentBatchIds] = useState<string[]>([]);

  // 1. Initialize from User Preferences (Database)
  useEffect(() => {
    if (user?.dashboardSettings?.recentBatches) {
      setRecentBatchIds(user.dashboardSettings.recentBatches);
    }
  }, [user]);

  // 2. Initialize Selection Logic
  useEffect(() => {
    if (batches.length === 0) return;

    // A. If we already have a selection, just ensure it's up to date
    if (selectedBatch) {
      const currentVersion = batches.find(
        (b) => b.batchId === selectedBatch.batchId
      );
      if (currentVersion && currentVersion !== selectedBatch) {
        setSelectedBatch(currentVersion);
      }
      if (currentVersion) return;
    }

    // B. Try to restore from User Preferences (Database)
    if (user?.dashboardSettings?.lastSelectedBatchId) {
      const savedBatch = batches.find(
        (b) => b.batchId === user.dashboardSettings?.lastSelectedBatchId
      );
      if (savedBatch) {
        setSelectedBatch(savedBatch);
        return;
      }
    }

    // C. Fallback to first batch
    if (!selectedBatch) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, user]);

  /**
   * Handle selecting a batch
   * Updates local state and persists to database
   */
  const handleSelectBatch = async (batch: Batch | null) => {
    setSelectedBatch(batch);

    if (batch && user) {
      // Calculate new history
      const currentHistory = user.dashboardSettings?.recentBatches || [];
      const newHistory = [
        batch.batchId,
        ...currentHistory.filter((id) => id !== batch.batchId),
      ].slice(0, 10);

      // Update local state immediately for UI responsiveness
      setRecentBatchIds(newHistory);

      // Persist to Database
      try {
        await updateDashboardSettings(user.userId, {
          lastSelectedBatchId: batch.batchId,
          recentBatches: newHistory,
        });
      } catch (error) {
        console.error("Failed to save batch selection preference:", error);
      }
    }
  };

  /**
   * Sort batches by recently selected
   */
  const sortedBatches = [...batches].sort((a, b) => {
    const indexA = recentBatchIds.indexOf(a.batchId);
    const indexB = recentBatchIds.indexOf(b.batchId);

    // If both are in history, lower index (more recent) comes first
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;

    // If only A is in history, A comes first
    if (indexA !== -1) return -1;

    // If only B is in history, B comes first
    if (indexB !== -1) return 1;

    // Fallback to original order (created date desc)
    return 0;
  });

  return {
    selectedBatch,
    setSelectedBatch: handleSelectBatch,
    sortedBatches,
    recentBatchIds,
  };
}
