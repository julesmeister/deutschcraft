/**
 * PlaygroundSessionContext
 * Global context for managing playground session state across navigation
 * Enables minimize mode that persists when switching pages
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PlaygroundRoom, PlaygroundParticipant, PlaygroundWriting } from '@/lib/models/playground';

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

const PlaygroundSessionContext = createContext<PlaygroundSessionContextValue | undefined>(undefined);

export function PlaygroundSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlaygroundSessionState | null>(null);

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
