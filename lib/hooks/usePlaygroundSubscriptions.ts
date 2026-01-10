/**
 * usePlaygroundSubscriptions Hook
 * Manages real-time subscriptions to room, participants, and writings
 */

import { useEffect } from 'react';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToWritings,
} from '@/lib/services/playgroundService';
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from '@/lib/models/playground';

interface UsePlaygroundSubscriptionsProps {
  currentRoom: PlaygroundRoom | null;
  userId: string;
  userRole: 'teacher' | 'student';
  handleLeaveRoom: () => Promise<void>;
  setParticipants: (participants: PlaygroundParticipant[]) => void;
  setWritings: (writings: PlaygroundWriting[]) => void;
}

export function usePlaygroundSubscriptions({
  currentRoom,
  userId,
  userRole,
  handleLeaveRoom,
  setParticipants,
  setWritings,
}: UsePlaygroundSubscriptionsProps) {
  // Subscribe to current room
  useEffect(() => {
    if (!currentRoom?.roomId) return;

    const roomId = currentRoom.roomId;
    const roomStatus = currentRoom.status;
    let isSubscriptionActive = true;

    const unsubRoom = subscribeToRoom(roomId, (room) => {
      if (!isSubscriptionActive) return;

      if (room) {
        // Only update if status changed to avoid infinite loops
        if (room.status !== roomStatus) {
          if (room.status === 'ended') {
            // Room ended - cleanup immediately without updating state
            isSubscriptionActive = false;
            handleLeaveRoom();
          }
        }
      }
    });

    const unsubParticipants = subscribeToParticipants(roomId, (parts) => {
      if (!isSubscriptionActive) return;
      setParticipants(parts);
    });

    const unsubWritings = subscribeToWritings(
      roomId,
      userId,
      userRole,
      setWritings
    );

    return () => {
      isSubscriptionActive = false;
      unsubRoom();
      unsubParticipants();
      unsubWritings();
    };
  }, [currentRoom?.roomId, currentRoom?.status, userId, userRole]);
}
