"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { GroupIsolationState, AudioControlState } from "./audioTypes";

const DEFAULT_ISOLATION: GroupIsolationState = {
  isIsolated: false,
  mutedUserIds: new Set(),
  myGroupIndex: -1,
};

/**
 * Centralized audio controller that manages both volume and isolation muting.
 * Precedence: isolation mute > user volume setting.
 */
export function useAudioController(
  audioElements: Map<string, HTMLAudioElement>,
  isolation: GroupIsolationState = DEFAULT_ISOLATION,
): AudioControlState {
  const [volumes, setVolumes] = useState<Map<string, number>>(new Map());
  const isolationRef = useRef(isolation);
  isolationRef.current = isolation;
  const volumesRef = useRef(volumes);
  volumesRef.current = volumes;

  // Apply mute + volume whenever isolation or volumes change
  useEffect(() => {
    audioElements.forEach((el, userId) => {
      const isMuted = isolation.isIsolated && isolation.mutedUserIds.has(userId);
      el.muted = isMuted;
      if (!isMuted) {
        el.volume = volumes.get(userId) ?? 1;
      }
    });
  }, [audioElements, isolation, volumes]);

  // Cleanup on unmount: unmute all, reset volumes
  useEffect(() => {
    return () => {
      audioElements.forEach((el) => {
        el.muted = false;
        el.volume = 1;
      });
    };
  }, [audioElements]);

  const setUserVolume = useCallback((userId: string, volume: number) => {
    setVolumes((prev) => new Map(prev).set(userId, volume));
    // Immediately apply if not isolated
    const el = audioElements.get(userId);
    if (el && !(isolationRef.current.isIsolated && isolationRef.current.mutedUserIds.has(userId))) {
      el.volume = volume;
    }
  }, [audioElements]);

  const getUserVolume = useCallback((userId: string) => {
    return volumesRef.current.get(userId) ?? 1;
  }, []);

  const isUserIsolated = useCallback((userId: string) => {
    return isolationRef.current.isIsolated && isolationRef.current.mutedUserIds.has(userId);
  }, []);

  return useMemo(() => (
    { setUserVolume, getUserVolume, isUserIsolated, audioElements }
  ), [setUserVolume, getUserVolume, isUserIsolated, audioElements]);
}
