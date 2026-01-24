/**
 * useMediaSession Hook
 * Handles starting and stopping WebRTC media sessions via WebSocket signaling
 */

import { useCallback } from 'react';
import { getAudioStream, getVideoStream, stopStream } from './mediaStreamManager';
import {
  type SignalingSocket,
  joinRoom,
  leaveRoom,
} from './socketSignaling';

interface UseMediaSessionProps {
  roomId: string;
  userId: string;
  userName: string;
  localAudioStreamRef: React.MutableRefObject<MediaStream | null>;
  localVideoStreamRef: React.MutableRefObject<MediaStream | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  socketRef: React.MutableRefObject<SignalingSocket | null>;
  isMediaActiveRef: React.MutableRefObject<boolean>;
  setIsVoiceActive: (active: boolean) => void;
  setIsVideoActive: (active: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  cleanup: () => void;
  onError?: (error: Error) => void;
}

export function useMediaSession({
  roomId,
  userId,
  userName,
  localAudioStreamRef,
  localVideoStreamRef,
  audioContextRef,
  socketRef,
  isMediaActiveRef,
  setIsVoiceActive,
  setIsVideoActive,
  setIsMuted,
  cleanup,
  onError,
}: UseMediaSessionProps) {
  const startVoice = useCallback(async () => {
    try {
      if (!roomId || !userId) throw new Error('No room ID or user ID');

      // Stop existing audio stream
      stopStream(localAudioStreamRef.current);
      localAudioStreamRef.current = null;

      const audioStream = await getAudioStream();
      localAudioStreamRef.current = audioStream;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsVoiceActive(true);
      setIsMuted(false);
      isMediaActiveRef.current = true;

      // Join signaling room (triggers addPeer events)
      if (socketRef.current?.connected) {
        joinRoom(socketRef.current, roomId, userId, userName);
      }
    } catch (error) {
      console.error('[Media Session] Failed to start voice:', error);
      setIsVoiceActive(false);
      onError?.(error as Error);
      throw error;
    }
  }, [roomId, userId, userName, localAudioStreamRef, audioContextRef, socketRef, isMediaActiveRef, setIsVoiceActive, setIsMuted, onError]);

  const startVideo = useCallback(async () => {
    try {
      if (!roomId || !userId) throw new Error('No room ID or user ID');

      // Stop existing streams
      stopStream(localAudioStreamRef.current);
      stopStream(localVideoStreamRef.current);
      localAudioStreamRef.current = null;
      localVideoStreamRef.current = null;

      const [audioStream, videoStream] = await Promise.all([
        getAudioStream(),
        getVideoStream(),
      ]);

      localAudioStreamRef.current = audioStream;
      localVideoStreamRef.current = videoStream;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsVoiceActive(true);
      setIsVideoActive(true);
      setIsMuted(false);
      isMediaActiveRef.current = true;

      if (socketRef.current?.connected) {
        joinRoom(socketRef.current, roomId, userId, userName);
      }
    } catch (error) {
      console.error('[Media Session] Failed to start video:', error);
      setIsVoiceActive(false);
      setIsVideoActive(false);
      onError?.(error as Error);
      throw error;
    }
  }, [roomId, userId, userName, localAudioStreamRef, localVideoStreamRef, audioContextRef, socketRef, isMediaActiveRef, setIsVoiceActive, setIsVideoActive, setIsMuted, onError]);

  const stopMedia = useCallback(() => {
    // Stop tracks immediately
    stopStream(localAudioStreamRef.current);
    stopStream(localVideoStreamRef.current);
    localAudioStreamRef.current = null;
    localVideoStreamRef.current = null;

    // Leave signaling room
    if (socketRef.current?.connected) {
      leaveRoom(socketRef.current);
    }

    cleanup();
    isMediaActiveRef.current = false;
  }, [localAudioStreamRef, localVideoStreamRef, socketRef, cleanup, isMediaActiveRef]);

  const stopVoice = useCallback(() => { stopMedia(); }, [stopMedia]);
  const stopVideo = useCallback(() => { stopMedia(); }, [stopMedia]);

  return { startVoice, startVideo, stopVoice, stopVideo, stopMedia };
}
