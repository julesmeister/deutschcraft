/**
 * useMediaControls Hook
 * Handles mute and video toggling for WebRTC media streams
 */

import { useCallback } from 'react';
import { updateMuteStatus } from './firebaseSignaling';
import { toggleAudioTracks, toggleVideoTracks, addVideoToStream } from './mediaStreamManager';

interface UseMediaControlsProps {
  roomId: string;
  userId: string;
  userName: string;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  peerConnectionsRef: React.MutableRefObject<Map<string, any>>;
  isMuted: boolean;
  isVideoActive: boolean;
  setIsMuted: (muted: boolean) => void;
  setIsVideoActive: (active: boolean) => void;
  onError?: (error: Error) => void;
}

export function useMediaControls({
  roomId,
  userId,
  userName,
  localStreamRef,
  peerConnectionsRef,
  isMuted,
  isVideoActive,
  setIsMuted,
  setIsVideoActive,
  onError,
}: UseMediaControlsProps) {
  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!localStreamRef.current) return false;

    const newMutedState = toggleAudioTracks(localStreamRef.current, isMuted);
    setIsMuted(newMutedState);
    await updateMuteStatus(roomId, userId, userName, newMutedState);

    console.log('[Media Controls] Mute toggled:', newMutedState ? 'MUTED' : 'UNMUTED');
    return newMutedState;
  }, [isMuted, roomId, userId, userName, localStreamRef, setIsMuted]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return false;

    const videoTracks = localStreamRef.current.getVideoTracks();

    // If no video tracks, add video
    if (videoTracks.length === 0) {
      try {
        const videoStream = await addVideoToStream(localStreamRef.current);

        // Add video tracks to all peer connections
        videoStream.getVideoTracks().forEach((track) => {
          peerConnectionsRef.current.forEach((peer) => {
            peer.pc.addTrack(track, localStreamRef.current!);
          });
        });

        setIsVideoActive(true);
        console.log('[Media Controls] ✅ Video started');
        return true;
      } catch (error) {
        console.error('[Media Controls] Failed to start video:', error);
        onError?.(error as Error);
        return false;
      }
    }

    // Toggle existing video tracks
    const newVideoState = toggleVideoTracks(localStreamRef.current, isVideoActive);
    setIsVideoActive(newVideoState);
    console.log('[Media Controls] Video toggled:', newVideoState ? 'ON' : 'OFF');

    return newVideoState;
  }, [isVideoActive, localStreamRef, peerConnectionsRef, setIsVideoActive, onError]);

  return { toggleMute, toggleVideo };
}
