/**
 * PlaygroundSessionContext
 * Global context for managing playground session state across navigation
 * Persists to sessionStorage so the minimized widget survives route changes
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { PlaygroundRoom, PlaygroundParticipant, PlaygroundWriting } from '@/lib/models/playground';

const STORAGE_KEY = 'playground-session';

interface PlaygroundSessionState {
  // Room data
  currentRoom: PlaygroundRoom | null;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  myParticipantId: string | null;

  // User info
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'teacher' | 'student';

  // View state
  isMinimized: boolean;

  // Media state
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
}

interface PlaygroundSessionContextValue {
  session: PlaygroundSessionState | null;

  // Session management
  startSession: (data: Omit<PlaygroundSessionState, 'isMinimized'>) => void;
  endSession: () => void;
  updateSession: (updates: Partial<PlaygroundSessionState>) => void;

  // Minimize control
  minimize: () => void;
  maximize: () => void;
  toggleMinimize: () => void;
}

function saveToStorage(state: PlaygroundSessionState | null) {
  try {
    if (state) {
      // Only persist essential fields (skip non-serializable data)
      const toStore = {
        currentRoom: state.currentRoom,
        participants: state.participants,
        myParticipantId: state.myParticipantId,
        userId: state.userId,
        userName: state.userName,
        userEmail: state.userEmail,
        userRole: state.userRole,
        isMinimized: state.isMinimized,
        isVoiceActive: state.isVoiceActive,
        isVideoActive: state.isVideoActive,
        isMuted: state.isMuted,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* storage unavailable */ }
}

function loadFromStorage(): PlaygroundSessionState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore with empty writings array (not critical for minimized display)
    if (parsed?.currentRoom?.roomId) {
      return { ...parsed, writings: parsed.writings || [] };
    }
    return null;
  } catch {
    return null;
  }
}

const PlaygroundSessionContext = createContext<PlaygroundSessionContextValue | undefined>(undefined);

export function PlaygroundSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlaygroundSessionState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setSession(stored);
    setHydrated(true);
  }, []);

  // Persist to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(session);
  }, [session, hydrated]);

  const startSession = useCallback((data: Omit<PlaygroundSessionState, 'isMinimized'>) => {
    setSession({
      ...data,
      isMinimized: false,
    });
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  const updateSession = useCallback((updates: Partial<PlaygroundSessionState>) => {
    setSession(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const minimize = useCallback(() => {
    setSession(prev => prev ? { ...prev, isMinimized: true } : null);
  }, []);

  const maximize = useCallback(() => {
    setSession(prev => prev ? { ...prev, isMinimized: false } : null);
  }, []);

  const toggleMinimize = useCallback(() => {
    setSession(prev => prev ? { ...prev, isMinimized: !prev.isMinimized } : null);
  }, []);

  return (
    <PlaygroundSessionContext.Provider
      value={{
        session,
        startSession,
        endSession,
        updateSession,
        minimize,
        maximize,
        toggleMinimize,
      }}
    >
      {children}
    </PlaygroundSessionContext.Provider>
  );
}

export function usePlaygroundSession() {
  const context = useContext(PlaygroundSessionContext);
  if (context === undefined) {
    throw new Error('usePlaygroundSession must be used within PlaygroundSessionProvider');
  }
  return context;
}
