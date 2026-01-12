/**
 * usePlaygroundSubscriptions Hook
 * Manages real-time subscriptions to room, participants, and writings
 */

import { useEffect, useRef } from 'react';
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
  setCurrentRoom: (room: PlaygroundRoom | null) => void;
  setParticipants: (participants: PlaygroundParticipant[]) => void;
  setWritings: (writings: PlaygroundWriting[]) => void;
}

export function usePlaygroundSubscriptions({
  currentRoom,
  userId,
  userRole,
  handleLeaveRoom,
  setCurrentRoom,
  setParticipants,
  setWritings,
}: UsePlaygroundSubscriptionsProps) {
  // Use refs to store latest callbacks without causing re-subscriptions
  const callbacksRef = useRef({
    handleLeaveRoom,
    setCurrentRoom,
    setParticipants,
    setWritings,
  });

  // Update refs on each render
  useEffect(() => {
    callbacksRef.current = {
      handleLeaveRoom,
      setCurrentRoom,
      setParticipants,
      setWritings,
    };
  });

  // Subscribe to current room
  useEffect(() => {
    if (!currentRoom?.roomId) return;

    const roomId = currentRoom.roomId;
    let isSubscriptionActive = true;

    const unsubRoom = subscribeToRoom(roomId, (room) => {
      if (!isSubscriptionActive) return;

      if (room) {
        // Update room state with all changes (including material updates)
        callbacksRef.current.setCurrentRoom(room);

        // Check if room ended
        if (room.status === 'ended') {
          // Room ended - cleanup immediately
          isSubscriptionActive = false;
          callbacksRef.current.handleLeaveRoom();
        }
      }
    });

    const unsubParticipants = subscribeToParticipants(roomId, (parts) => {
      if (!isSubscriptionActive) return;
      callbacksRef.current.setParticipants(parts);
    });

    const unsubWritings = subscribeToWritings(
      roomId,
      userId,
      userRole,
      (writings) => {
        if (!isSubscriptionActive) return;
        callbacksRef.current.setWritings(writings);
      }
    );

    return () => {
      isSubscriptionActive = false;
      unsubRoom();
      unsubParticipants();
      unsubWritings();
    };
  }, [currentRoom?.roomId, userId, userRole]);
}
