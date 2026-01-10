/**
 * usePlaygroundSessionSync Hook
 * Syncs playground state with session context for minimize/restore
 */

import { useEffect } from 'react';
import { usePlaygroundSession } from '@/lib/contexts/PlaygroundSessionContext';
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from '@/lib/models/playground';

interface UsePlaygroundSessionSyncProps {
  currentRoom: PlaygroundRoom | null;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  myParticipantId: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'teacher' | 'student';
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
}

export function usePlaygroundSessionSync(props: UsePlaygroundSessionSyncProps) {
  const playgroundSession = usePlaygroundSession();

  const {
    currentRoom,
    participants,
    writings,
    myParticipantId,
    userId,
    userName,
    userEmail,
    userRole,
    isVoiceActive,
    isVideoActive,
    isMuted,
  } = props;

  // Sync with session context when room state changes
  useEffect(() => {
    if (currentRoom && userId && userName && userEmail) {
      playgroundSession.updateSession({
        currentRoom,
        participants,
        writings,
        myParticipantId,
        userId,
        userName,
        userEmail,
        userRole,
        isVoiceActive,
        isVideoActive,
        isMuted,
      });
    }
    // Only update when these specific values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentRoom?.roomId,
    participants.length,
    writings.length,
    myParticipantId,
    isVoiceActive,
    isVideoActive,
    isMuted,
  ]);

  // Start session when joining a room
  useEffect(() => {
    if (currentRoom && userId && userName && userEmail && !playgroundSession.session) {
      playgroundSession.startSession({
        currentRoom,
        participants,
        writings,
        myParticipantId,
        userId,
        userName,
        userEmail,
        userRole,
        isVoiceActive,
        isVideoActive,
        isMuted,
      });
    }
  }, [currentRoom?.roomId]);

  return { playgroundSession };
}
