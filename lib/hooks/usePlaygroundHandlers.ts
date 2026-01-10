/**
 * usePlaygroundHandlers Hook
 * Encapsulates all handler functions for playground room management
 */

import { useState, useCallback } from 'react';
import {
  createPlaygroundRoom,
  endPlaygroundRoom,
  joinPlaygroundRoom,
  leavePlaygroundRoom,
  updateParticipantVoiceStatus,
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
}

export function usePlaygroundHandlers({
  userId,
  userName,
  userEmail,
  userRole,
  myParticipantId,
  currentRoom,
  isVoiceActive,
  isVideoActive,
  isMuted,
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
}: UsePlaygroundHandlersProps) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = useCallback(async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const roomTitle = `${userName}'s Room`;
      const roomId = await createPlaygroundRoom(userId, userName, roomTitle);

      const participantId = await joinPlaygroundRoom(
        roomId,
        userId,
        userName,
        userEmail,
        userRole,
        undefined // No peerId needed with native WebRTC
      );

      setMyParticipantId(participantId);

      const rooms = await getActiveRooms();
      const room = rooms.find((r) => r.roomId === roomId);

      if (room) {
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
  }, [isCreatingRoom, userId, userName, userEmail, userRole, setMyParticipantId, setCurrentRoom, setDialogState]);

  const handleJoinRoom = useCallback(async (room: PlaygroundRoom) => {
    try {
      const participantId = await joinPlaygroundRoom(
        room.roomId,
        userId,
        userName,
        userEmail,
        userRole,
        undefined // No peerId needed with native WebRTC
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
      // Silent error handling
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
      console.error('[Playground] Failed to end room:', error);
    }
  }, [currentRoom, userId, myParticipantId, stopVoice, setCurrentRoom, setMyParticipantId, setParticipants, setWritings, loadActiveRooms]);

  const handleToggleRoomPublicWriting = useCallback(async (isPublic: boolean) => {
    if (!currentRoom) return;

    try {
      await toggleRoomPublicWriting(currentRoom.roomId, isPublic);
    } catch (error) {
      // Silent error handling
      console.error('[Playground] Failed to toggle room public writing:', error);
    }
  }, [currentRoom]);

  const handleSaveWriting = useCallback(async (content: string) => {
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
  }, [currentRoom, userId, userName]);

  const handleToggleWritingVisibility = useCallback(async (
    writingId: string,
    isPublic: boolean
  ) => {
    try {
      await toggleWritingVisibility(writingId, isPublic);
    } catch (error) {
      // Silent error handling
      console.error('[Playground] Failed to toggle writing visibility:', error);
    }
  }, []);

  const handleStartVoice = useCallback(async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVoice();
      await updateParticipantVoiceStatus(myParticipantId, true, false);
    } catch (error) {
      console.error('[Voice] Failed to start voice:', error);
      setDialogState({
        isOpen: true,
        title: 'Voice Error',
        message: 'Failed to start voice. Please check microphone permissions.',
      });
    }
  }, [myParticipantId, currentRoom, startVoice, setDialogState]);

  const handleStopVoice = useCallback(async () => {
    if (!myParticipantId) return;

    try {
      await stopVoice();
      await updateParticipantVoiceStatus(myParticipantId, false, false);
    } catch (error) {
      console.error('[Voice] Failed to stop voice:', error);
    }
  }, [myParticipantId, stopVoice]);

  const handleToggleMute = useCallback(async () => {
    if (!myParticipantId) return;

    try {
      const newMutedState = await toggleMute();

      if (typeof newMutedState === 'boolean') {
        await updateParticipantVoiceStatus(myParticipantId, isVoiceActive, newMutedState);
      }
    } catch (error) {
      console.error('[Voice] Failed to toggle mute:', error);
    }
  }, [myParticipantId, toggleMute, isVoiceActive]);

  const handleStartVideo = useCallback(async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVideo();
      await updateParticipantVoiceStatus(myParticipantId, true, false);
    } catch (error: any) {
      console.error('[Video] Failed to start video:', error);
      setDialogState({
        isOpen: true,
        title: 'Video Error',
        message: `Failed to start video: ${error.name || 'Unknown error'}. Please check camera permissions.`,
      });
    }
  }, [myParticipantId, currentRoom, startVideo, setDialogState]);

  const handleToggleVideo = useCallback(async () => {
    if (!myParticipantId) return;

    try {
      await toggleVideo();
    } catch (error) {
      console.error('[Video] Failed to toggle video:', error);
    }
  }, [myParticipantId, toggleVideo]);

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
