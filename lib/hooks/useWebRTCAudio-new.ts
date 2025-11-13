/**
 * useWebRTCAudio Hook (Refactored)
 * Native WebRTC implementation for voice chat
 * Split into smaller modules for better maintainability
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { sanitizeUserId } from './webrtc/config';
import { registerParticipant, unregisterParticipant, updateMuteStatus } from './webrtc/signaling';
import { usePeerConnection } from './webrtc/usePeerConnection';
import type { AudioParticipant, UseWebRTCAudioOptions } from './webrtc/types';

export function useWebRTCAudio({
  roomId,
  userId,
  userName,
  onError,
}: UseWebRTCAudioOptions) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<AudioParticipant[]>([]);
  const [audioStreams, setAudioStreams] = useState<Map<string, MediaStream>>(new Map());

  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousRoomIdRef = useRef<string | null>(null);

  const sanitizedUserId = sanitizeUserId(userId);

  // Handle remote streams
  const handleRemoteStream = useCallback((remoteUserId: string, stream: MediaStream) => {
    setAudioStreams((prev) => {
      const updated = new Map(prev);
      updated.set(remoteUserId, stream);
      return updated;
    });
  }, []);

  // Peer connection management
  const { createPeerConnection, closeAllConnections } = usePeerConnection({
    roomId,
    userId,
    localStream: localStreamRef.current,
    onRemoteStream: handleRemoteStream,
    onError,
  });

  // Reset state when room changes
  useEffect(() => {
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      console.log('[WebRTC] Room changed, resetting voice state');

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      closeAllConnections();

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsVoiceActive(false);
      setIsMuted(false);
      setParticipants([]);
      setAudioStreams(new Map());
    }
    previousRoomIdRef.current = roomId;
  }, [roomId, closeAllConnections]);

  // Listen for other participants
  useEffect(() => {
    if (!roomId || !userId) return;

    const participantsRef = dbRef(rtdb, `playground_voice/${roomId}/participants`);

    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const participantList: AudioParticipant[] = [];
      Object.entries(data).forEach(([id, info]: [string, any]) => {
        if (id !== sanitizedUserId) {
          participantList.push({
            userId: info.originalUserId || id,
            userName: info.userName || 'Unknown',
            isMuted: info.isMuted || false,
            audioLevel: 0,
            connectionQuality: 'disconnected',
          });
        }
      });

      setParticipants(participantList);
    });

    return () => unsubscribe();
  }, [roomId, userId, sanitizedUserId]);

  // Start voice
  const startVoice = useCallback(async () => {
    try {
      console.log('[WebRTC] Starting voice...', { roomId, userId, userName });

      if (!roomId || !userId) {
        throw new Error('No room ID or user ID provided');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      });

      console.log('[WebRTC] Got microphone stream:', stream.id);

      localStreamRef.current = stream;
      setIsVoiceActive(true);
      setIsMuted(false);

      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        console.log('[WebRTC] Enabled audio track:', track.label);
      });

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      await registerParticipant(roomId, userId, userName, false);
      console.log('[WebRTC] ✅ Voice started successfully');
    } catch (error) {
      console.error('[WebRTC] ❌ Failed to start voice:', error);
      setIsVoiceActive(false);
      onError?.(error as Error);
      throw error;
    }
  }, [roomId, userId, userName, onError]);

  // Stop voice
  const stopVoice = useCallback(async () => {
    console.log('[WebRTC] Stopping voice...');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    closeAllConnections();

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    await unregisterParticipant(roomId, userId);

    setIsVoiceActive(false);
    setAudioStreams(new Map());

    console.log('[WebRTC] Voice stopped');
  }, [roomId, userId, closeAllConnections]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!localStreamRef.current) {
      console.warn('[WebRTC] Cannot toggle mute - no local stream');
      return false;
    }

    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('[WebRTC] Cannot toggle mute - no audio tracks');
      return false;
    }

    const newMutedState = !isMuted;

    audioTracks.forEach((track) => {
      track.enabled = !newMutedState;
      console.log('[WebRTC] Track enabled:', track.enabled);
    });

    setIsMuted(newMutedState);
    await updateMuteStatus(roomId, userId, userName, newMutedState);

    console.log('[WebRTC] Mute toggled:', newMutedState ? 'MUTED' : 'UNMUTED');
    return newMutedState;
  }, [isMuted, roomId, userId, userName]);

  // Connect to new participants
  useEffect(() => {
    if (!isVoiceActive || participants.length === 0) return;

    console.log('[WebRTC] Attempting to connect to participants...');
    participants.forEach((participant) => {
      const isInitiator = userId < participant.userId;
      console.log('[WebRTC] Connecting to:', participant.userName, 'isInitiator:', isInitiator);
      createPeerConnection(participant.userId, participant.userName, isInitiator);
    });
  }, [participants, isVoiceActive, userId, createPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        stopVoice();
      }
    };
  }, [roomId, stopVoice]);

  return {
    isVoiceActive,
    isMuted,
    participants,
    audioStreams,
    startVoice,
    stopVoice,
    toggleMute,
  };
}
