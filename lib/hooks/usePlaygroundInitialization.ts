/**
 * usePlaygroundInitialization Hook
 * Handles initial loading of rooms and session restoration
 */

import { useEffect, useCallback } from 'react';
import { getActiveRooms, getRoomParticipants } from '@/lib/services/playgroundService';
import type { PlaygroundRoom } from '@/lib/models/playground';

interface UsePlaygroundInitializationProps {
  userId: string;
  setActiveRooms: (rooms: PlaygroundRoom[]) => void;
  setCurrentRoom: (room: PlaygroundRoom | null) => void;
  setMyParticipantId: (id: string | null) => void;
}

export function usePlaygroundInitialization({
  userId,
  setActiveRooms,
  setCurrentRoom,
  setMyParticipantId,
}: UsePlaygroundInitializationProps) {
  // Load active rooms function
  const loadActiveRooms = useCallback(async () => {
    try {
      const rooms = await getActiveRooms();
      setActiveRooms(rooms);
    } catch (error) {
      console.error('[Playground] Failed to load rooms:', error);
    }
  }, [setActiveRooms]);

  // Load active rooms and restore session on mount
  useEffect(() => {
    const initializePlayground = async () => {
      console.log('[Playground Init] Starting initialization, userId:', userId);

      if (!userId) {
        console.log('[Playground Init] No userId, skipping initialization');
        return;
      }

      try {
        // Load all active rooms
        console.log('[Playground Init] Fetching active rooms...');
        const rooms = await getActiveRooms();
        console.log('[Playground Init] Fetched rooms:', rooms.length, rooms);
        setActiveRooms(rooms);

        // Check if user is already in a room (restore session after refresh)
        for (const room of rooms) {
          const roomParticipants = await getRoomParticipants(room.roomId);
          const myParticipant = roomParticipants.find(p => p.userId === userId && !p.leftAt);

          if (myParticipant) {
            console.log('[Playground Init] Found existing participant, restoring room:', room.roomId);
            setCurrentRoom(room);
            setMyParticipantId(myParticipant.participantId);
            break; // User can only be in one room at a time
          }
        }
      } catch (error) {
        console.error('[Playground] Failed to initialize:', error);
      }
    };

    initializePlayground();
    // Only run when userId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { loadActiveRooms };
}
