/**
 * usePlaygroundHandlers Hook
 * Encapsulates room management and writing handler functions
 */

import { useState, useCallback } from 'react';
import {
  createPlaygroundRoom,
  endPlaygroundRoom,
  joinPlaygroundRoom,
  leavePlaygroundRoom,
  togglePublicWriting as toggleRoomPublicWriting,
  savePlaygroundWriting,
  toggleWritingVisibility,
  getActiveRooms,
} from '@/lib/services/playgroundService';
import { usePlaygroundMediaHandlers } from './usePlaygroundMediaHandlers';
import type { PlaygroundRoom } from '@/lib/models/playground';

interface UsePlaygroundHandlersProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'teacher' | 'student';
  myParticipantId: string | null;
  currentRoom: PlaygroundRoom | null;
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
  setDialogState: (state: { isOpen: boolean; title: string; message: string }) => void;
  setMyParticipantId: (id: string | null) => void;
  setCurrentRoom: (room: PlaygroundRoom | null) => void;
  setParticipants: (participants: any[]) => void;
  setWritings: (writings: any[]) => void;
  stopVoice: () => void;
  startVoice: () => Promise<void>;
  startVideo: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => Promise<boolean>;
  loadActiveRooms: () => Promise<void>;
  onCameraError?: (error: { name: string; message: string }) => void;
}

export function usePlaygroundHandlers({
  userId,
  userName,
  userEmail,
  userRole,
  myParticipantId,
  currentRoom,
  isVoiceActive,
  setDialogState,
  setMyParticipantId,
  setCurrentRoom,
  setParticipants,
  setWritings,
  stopVoice,
  startVoice,
  startVideo,
  toggleMute,
  toggleVideo,
  loadActiveRooms,
  onCameraError,
}: UsePlaygroundHandlersProps) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Media handlers (voice/video)
  const {
    handleStartVoice,
    handleStartVideo,
    handleStopVoice,
    handleToggleMute,
    handleToggleVideo,
  } = usePlaygroundMediaHandlers({
    myParticipantId,
    currentRoom,
    isVoiceActive,
    setDialogState,
    stopVoice,
    startVoice,
    startVideo,
    toggleMute,
    toggleVideo,
    onCameraError,
  });

  const handleCreateRoom = useCallback(async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const roomTitle = `${userName}'s Room`;
      const roomId = await createPlaygroundRoom(userId, userName, roomTitle);

      const participantId = await joinPlaygroundRoom(
        roomId, userId, userName, userEmail, userRole, undefined
      );

      setMyParticipantId(participantId);

      const rooms = await getActiveRooms();
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) setCurrentRoom(room);

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
  }, [isCreatingRoom, userId, userName, userEmail, userRole, setMyParticipantId, setCurrentRoom, setDialogState]);

  const handleJoinRoom = useCallback(async (room: PlaygroundRoom) => {
    try {
      const participantId = await joinPlaygroundRoom(
        room.roomId, userId, userName, userEmail, userRole, undefined
      );

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
  }, [userId, userName, userEmail, userRole, setMyParticipantId, setCurrentRoom, setDialogState]);

  const handleLeaveRoom = useCallback(async () => {
    if (!currentRoom || !myParticipantId) return;

    try {
      await leavePlaygroundRoom(myParticipantId, currentRoom.roomId);
    } catch (error) {
      console.error('[Playground] Failed to leave room:', error);
    } finally {
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);
      loadActiveRooms();
    }
  }, [currentRoom, myParticipantId, stopVoice, setCurrentRoom, setMyParticipantId, setParticipants, setWritings, loadActiveRooms]);

  const handleEndRoom = useCallback(async () => {
    if (!currentRoom || userId !== currentRoom.hostId) return;

    const roomIdToEnd = currentRoom.roomId;
    const participantIdToLeave = myParticipantId;

    try {
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);

      await endPlaygroundRoom(roomIdToEnd);

      if (participantIdToLeave) {
        await leavePlaygroundRoom(participantIdToLeave, roomIdToEnd);
      }

      loadActiveRooms();
    } catch (error) {
      console.error('[Playground] Failed to end room:', error);
    }
  }, [currentRoom, userId, myParticipantId, stopVoice, setCurrentRoom, setMyParticipantId, setParticipants, setWritings, loadActiveRooms]);

  const handleToggleRoomPublicWriting = useCallback(async (isPublic: boolean) => {
    if (!currentRoom) return;
    try {
      await toggleRoomPublicWriting(currentRoom.roomId, isPublic);
    } catch (error) {
      console.error('[Playground] Failed to toggle room public writing:', error);
    }
  }, [currentRoom]);

  const handleSaveWriting = useCallback(async (content: string) => {
    if (!currentRoom) return;
    try {
      await savePlaygroundWriting(currentRoom.roomId, userId, userName, content, false);
    } catch (error) {
      throw error;
    }
  }, [currentRoom, userId, userName]);

  const handleToggleWritingVisibility = useCallback(async (writingId: string, isPublic: boolean) => {
    try {
      await toggleWritingVisibility(writingId, isPublic);
    } catch (error) {
      console.error('[Playground] Failed to toggle writing visibility:', error);
    }
  }, []);

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
    handleStartVideo,
    handleStopVoice,
    handleToggleMute,
    handleToggleVideo,
  };
}
