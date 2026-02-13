/**
 * usePlaygroundMediaHandlers Hook
 * Voice and video handler functions for playground rooms
 */

import { useCallback } from 'react';
import { updateParticipantVoiceStatus } from '@/lib/services/playgroundService';
import type { PlaygroundRoom } from '@/lib/models/playground';

const CAMERA_ERROR_NAMES = new Set(['NotAllowedError', 'AbortError', 'NotFoundError', 'NotReadableError']);

interface UsePlaygroundMediaHandlersProps {
  myParticipantId: string | null;
  currentRoom: PlaygroundRoom | null;
  isVoiceActive: boolean;
  setDialogState: (state: { isOpen: boolean; title: string; message: string }) => void;
  stopVoice: () => void;
  startVoice: () => Promise<void>;
  startVideo: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => Promise<boolean>;
  onCameraError?: (error: { name: string; message: string }) => void;
}

export function usePlaygroundMediaHandlers({
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
}: UsePlaygroundMediaHandlersProps) {
  const handleStartVoice = useCallback(async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVoice();
      updateParticipantVoiceStatus(myParticipantId, true, false).catch(() => {});
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
    } catch (error) {
      console.error('[Voice] Failed to stop voice:', error);
    }

    updateParticipantVoiceStatus(myParticipantId, false, false).catch(() => {});
  }, [myParticipantId, stopVoice]);

  const handleToggleMute = useCallback(async () => {
    if (!myParticipantId) return;

    try {
      const newMutedState = await toggleMute();

      if (typeof newMutedState === 'boolean') {
        updateParticipantVoiceStatus(myParticipantId, isVoiceActive, newMutedState).catch(() => {});
      }
    } catch (error) {
      console.error('[Voice] Failed to toggle mute:', error);
    }
  }, [myParticipantId, toggleMute, isVoiceActive]);

  const handleStartVideo = useCallback(async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVideo();
      updateParticipantVoiceStatus(myParticipantId, true, false).catch(() => {});
    } catch (error: any) {
      console.error('[Video] Failed to start video:', error);
      if (onCameraError && CAMERA_ERROR_NAMES.has(error?.name)) {
        onCameraError({ name: error.name, message: error.message || '' });
      } else {
        setDialogState({
          isOpen: true,
          title: 'Video Error',
          message: `Failed to start video: ${error?.name || 'Unknown error'}. Please check camera permissions.`,
        });
      }
    }
  }, [myParticipantId, currentRoom, startVideo, setDialogState, onCameraError]);

  const handleToggleVideo = useCallback(async () => {
    if (!myParticipantId) return;

    try {
      await toggleVideo();
    } catch (error: any) {
      console.error('[Video] Failed to toggle video:', error);
      if (onCameraError && CAMERA_ERROR_NAMES.has(error?.name)) {
        onCameraError({ name: error.name, message: error.message || '' });
      }
    }
  }, [myParticipantId, toggleVideo, onCameraError]);

  return {
    handleStartVoice,
    handleStartVideo,
    handleStopVoice,
    handleToggleMute,
    handleToggleVideo,
  };
}
