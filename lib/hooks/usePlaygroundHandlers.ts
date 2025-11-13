/**
 * usePlaygroundHandlers Hook
 * Encapsulates all handler functions for playground room management
 */

import { useState } from 'react';
import {
  createPlaygroundRoom,
  endPlaygroundRoom,
  joinPlaygroundRoom,
  leavePlaygroundRoom,
  updateParticipantVoiceStatus,
  updateParticipantPeerId,
  togglePublicWriting as toggleRoomPublicWriting,
  savePlaygroundWriting,
  toggleWritingVisibility,
  getActiveRooms,
} from '@/lib/services/playgroundService';
import type { PlaygroundRoom } from '@/lib/models/playground';

interface UsePlaygroundHandlersProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'teacher' | 'student';
  myPeerId: string | null;
  myParticipantId: string | null;
  currentRoom: PlaygroundRoom | null;
  isVoiceActive: boolean;
  isMuted: boolean;
  setDialogState: (state: { isOpen: boolean; title: string; message: string }) => void;
  setMyParticipantId: (id: string | null) => void;
  setCurrentRoom: (room: PlaygroundRoom | null) => void;
  setParticipants: (participants: any[]) => void;
  setWritings: (writings: any[]) => void;
  stopVoice: () => void;
  startVoice: () => Promise<void>;
  toggleMute: () => void;
  loadActiveRooms: () => Promise<void>;
}

export function usePlaygroundHandlers({
  userId,
  userName,
  userEmail,
  userRole,
  myPeerId,
  myParticipantId,
  currentRoom,
  isVoiceActive,
  isMuted,
  setDialogState,
  setMyParticipantId,
  setCurrentRoom,
  setParticipants,
  setWritings,
  stopVoice,
  startVoice,
  toggleMute,
  loadActiveRooms,
}: UsePlaygroundHandlersProps) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const roomTitle = `${userName}'s Room`;
      console.log('[Playground] Creating room:', { userId, userName, roomTitle });
      const roomId = await createPlaygroundRoom(userId, userName, roomTitle);
      console.log('[Playground] Room created:', roomId);

      console.log('[Playground] Joining created room as participant...');
      const participantId = await joinPlaygroundRoom(
        roomId,
        userId,
        userName,
        userEmail,
        userRole,
        myPeerId || undefined
      );
      console.log('[Playground] Joined as participant:', participantId);

      setMyParticipantId(participantId);

      const rooms = await getActiveRooms();
      const room = rooms.find((r) => r.roomId === roomId);

      if (room) {
        console.log('[Playground] Setting current room:', room);
        setCurrentRoom(room);
      }

      setDialogState({
        isOpen: true,
        title: 'Room Created',
        message: 'Your playground room has been created successfully!',
      });
    } catch (error) {
      console.error('[Playground] Error creating room:', error);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to create room. Please try again.',
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (room: PlaygroundRoom) => {
    try {
      console.log('[Playground] Joining room:', room.roomId, { userId, userName, userEmail, userRole });
      const participantId = await joinPlaygroundRoom(
        room.roomId,
        userId,
        userName,
        userEmail,
        userRole,
        myPeerId || undefined
      );

      console.log('[Playground] Joined as participant:', participantId);
      setMyParticipantId(participantId);
      setCurrentRoom(room);
    } catch (error) {
      console.error('[Playground] Error joining room:', error);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to join room. Please try again.',
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !myParticipantId) return;

    try {
      await leavePlaygroundRoom(myParticipantId, currentRoom.roomId);
    } catch (error) {
      // Silent error handling
    } finally {
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);
      loadActiveRooms();
    }
  };

  const handleEndRoom = async () => {
    if (!currentRoom || userId !== currentRoom.hostId) return;

    const roomIdToEnd = currentRoom.roomId;
    const participantIdToLeave = myParticipantId;

    try {
      // First cleanup local state immediately
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);

      // Then update Firestore
      await endPlaygroundRoom(roomIdToEnd);

      if (participantIdToLeave) {
        await leavePlaygroundRoom(participantIdToLeave, roomIdToEnd);
      }

      loadActiveRooms();
    } catch (error) {
      // Silent error handling
    }
  };

  const handleToggleRoomPublicWriting = async (isPublic: boolean) => {
    if (!currentRoom) return;

    try {
      await toggleRoomPublicWriting(currentRoom.roomId, isPublic);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleSaveWriting = async (content: string) => {
    if (!currentRoom) return;

    try {
      await savePlaygroundWriting(
        currentRoom.roomId,
        userId,
        userName,
        content,
        false
      );
    } catch (error) {
      throw error;
    }
  };

  const handleToggleWritingVisibility = async (
    writingId: string,
    isPublic: boolean
  ) => {
    try {
      await toggleWritingVisibility(writingId, isPublic);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleStartVoice = async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVoice();

      // Update Firestore with voice active status
      await updateParticipantVoiceStatus(myParticipantId, true, false);

      // Update peer ID if we have one
      if (myPeerId) {
        await updateParticipantPeerId(myParticipantId, myPeerId);
      }
    } catch (error) {
      console.error('[Voice] Failed to start voice:', error);
      setDialogState({
        isOpen: true,
        title: 'Voice Error',
        message: 'Failed to start voice. Please check microphone permissions.',
      });
    }
  };

  const handleStopVoice = async () => {
    if (!myParticipantId) return;

    try {
      stopVoice();
      await updateParticipantVoiceStatus(myParticipantId, false, false);
    } catch (error) {
      // Silent error
    }
  };

  const handleToggleMute = async () => {
    if (!myParticipantId) return;

    try {
      toggleMute();
      await updateParticipantVoiceStatus(myParticipantId, isVoiceActive, !isMuted);
    } catch (error) {
      // Silent error
    }
  };

  return {
    isCreatingRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleEndRoom,
    handleToggleRoomPublicWriting,
    handleSaveWriting,
    handleToggleWritingVisibility,
    handleStartVoice,
    handleStopVoice,
    handleToggleMute,
  };
}
