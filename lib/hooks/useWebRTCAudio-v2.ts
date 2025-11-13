/**
 * useWebRTCAudio Hook v2
 * Simplified WebRTC implementation with Firebase broadcast signaling
 * Based on official Firebase WebRTC best practices
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { ICE_SERVERS } from './webrtc/config';
import {
  broadcastSignal,
  listenForSignals,
  registerParticipant,
  unregisterParticipant,
  updateMuteStatus,
  listenForParticipants,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  type SignalMessage,
} from './webrtc/firebaseSignaling';
import type { AudioParticipant, UseWebRTCAudioOptions } from './webrtc/types';

interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

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
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousRoomIdRef = useRef<string | null>(null);
  const signalUnsubscribeRef = useRef<(() => void) | null>(null);
  const participantsUnsubscribeRef = useRef<(() => void) | null>(null);

  // Reset state when room changes
  useEffect(() => {
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      console.log('[WebRTC] Room changed, resetting state');
      cleanup();
    }
    previousRoomIdRef.current = roomId;
  }, [roomId]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((peer) => {
      peer.pc.close();
      if (peer.stream) {
        peer.stream.getTracks().forEach((track) => track.stop());
      }
    });
    peerConnectionsRef.current.clear();

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Unsubscribe from signals
    if (signalUnsubscribeRef.current) {
      signalUnsubscribeRef.current();
      signalUnsubscribeRef.current = null;
    }

    // Unsubscribe from participants
    if (participantsUnsubscribeRef.current) {
      participantsUnsubscribeRef.current();
      participantsUnsubscribeRef.current = null;
    }

    setIsVoiceActive(false);
    setIsMuted(false);
    setParticipants([]);
    setAudioStreams(new Map());
  }, []);

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      console.log('[WebRTC] Creating peer connection for:', remoteUserId);

      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
      });

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log('[WebRTC] Sending ICE candidate to:', remoteUserId);
          await sendIceCandidate(roomId, userId, remoteUserId, event.candidate.toJSON());
        }
      };

      // Handle incoming stream
      pc.ontrack = (event) => {
        console.log('[WebRTC] 🎵 Received track from:', remoteUserId);
        const [remoteStream] = event.streams;

        if (remoteStream) {
          const peer = peerConnectionsRef.current.get(remoteUserId);
          if (peer) {
            peer.stream = remoteStream;
          }

          setAudioStreams((prev) => {
            const updated = new Map(prev);
            updated.set(remoteUserId, remoteStream);
            return updated;
          });

          // Play audio
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.autoplay = true;
          audio.play().catch((err) => {
            console.error('[WebRTC] Failed to play audio:', err);
          });

          console.log('[WebRTC] ✅ Playing audio from:', remoteUserId);
        }
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state with', remoteUserId, ':', pc.connectionState);

        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.log('[WebRTC] Connection failed, cleaning up peer:', remoteUserId);
          peerConnectionsRef.current.delete(remoteUserId);
        }
      };

      // Store connection
      peerConnectionsRef.current.set(remoteUserId, { pc, stream: null });

      return pc;
    },
    [roomId, userId]
  );

  // Handle incoming signals
  const handleSignal = useCallback(
    async (signal: SignalMessage) => {
      const { type, fromUserId, data } = signal;

      console.log('[WebRTC] Processing signal:', type, 'from:', fromUserId);

      try {
        // Get or create peer connection
        let peer = peerConnectionsRef.current.get(fromUserId);
        if (!peer) {
          const pc = createPeerConnection(fromUserId);
          peer = { pc, stream: null };
        }

        const { pc } = peer;

        switch (type) {
          case 'offer':
            console.log('[WebRTC] Received offer from:', fromUserId);
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendAnswer(roomId, userId, fromUserId, answer);
            console.log('[WebRTC] Sent answer to:', fromUserId);
            break;

          case 'answer':
            console.log('[WebRTC] Received answer from:', fromUserId);
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            break;

          case 'ice-candidate':
            console.log('[WebRTC] Received ICE candidate from:', fromUserId);
            if (data) {
              await pc.addIceCandidate(new RTCIceCandidate(data));
            }
            break;

          case 'participant-joined':
            console.log('[WebRTC] Participant joined:', fromUserId);
            // Initiate connection if we're the "older" user (lexicographic order)
            if (userId < fromUserId && isVoiceActive) {
              setTimeout(async () => {
                const newPeer = peerConnectionsRef.current.get(fromUserId);
                if (!newPeer) {
                  const pc = createPeerConnection(fromUserId);
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  await sendOffer(roomId, userId, fromUserId, offer);
                  console.log('[WebRTC] Sent offer to new participant:', fromUserId);
                }
              }, Math.random() * 500); // Random delay to prevent collision
            }
            break;

          case 'participant-left':
            console.log('[WebRTC] Participant left:', fromUserId);
            const leavingPeer = peerConnectionsRef.current.get(fromUserId);
            if (leavingPeer) {
              leavingPeer.pc.close();
              if (leavingPeer.stream) {
                leavingPeer.stream.getTracks().forEach((track) => track.stop());
              }
              peerConnectionsRef.current.delete(fromUserId);

              setAudioStreams((prev) => {
                const updated = new Map(prev);
                updated.delete(fromUserId);
                return updated;
              });
            }
            break;
        }
      } catch (error) {
        console.error('[WebRTC] Error handling signal:', type, error);
      }
    },
    [roomId, userId, isVoiceActive, createPeerConnection]
  );

  // Start voice
  const startVoice = useCallback(async () => {
    try {
      console.log('[WebRTC] Starting voice...', { roomId, userId, userName });

      if (!roomId || !userId) {
        throw new Error('No room ID or user ID provided');
      }

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      });

      console.log('[WebRTC] Got microphone stream');

      localStreamRef.current = stream;
      setIsVoiceActive(true);
      setIsMuted(false);

      // Enable audio tracks
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Register participant
      await registerParticipant(roomId, userId, userName, false);

      // Listen for signals
      console.log('[WebRTC] Setting up signal listener for room:', roomId);
      signalUnsubscribeRef.current = listenForSignals(roomId, userId, handleSignal);

      // Listen for participants
      console.log('[WebRTC] Setting up participant listener for room:', roomId);
      participantsUnsubscribeRef.current = listenForParticipants(
        roomId,
        userId,
        (participants) => {
          console.log('[WebRTC] Participants updated:', participants.length, participants);
          setParticipants(participants);

          // Log connection status
          if (participants.length === 0) {
            console.log('[WebRTC] ⚠️ No other participants in room - waiting for someone to join');
          } else {
            console.log('[WebRTC] 👥 Found', participants.length, 'other participant(s)');
          }
        }
      );

      console.log('[WebRTC] ✅ Voice started successfully - waiting for other participants');
    } catch (error) {
      console.error('[WebRTC] ❌ Failed to start voice:', error);
      setIsVoiceActive(false);
      onError?.(error as Error);
      throw error;
    }
  }, [roomId, userId, userName, handleSignal, onError]);

  // Stop voice
  const stopVoice = useCallback(async () => {
    console.log('[WebRTC] Stopping voice...');

    if (roomId && userId) {
      await unregisterParticipant(roomId, userId);
    }

    cleanup();

    console.log('[WebRTC] Voice stopped');
  }, [roomId, userId, cleanup]);

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
    });

    setIsMuted(newMutedState);
    await updateMuteStatus(roomId, userId, userName, newMutedState);

    console.log('[WebRTC] Mute toggled:', newMutedState ? 'MUTED' : 'UNMUTED');
    return newMutedState;
  }, [isMuted, roomId, userId, userName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        stopVoice();
      }
    };
  }, [stopVoice]);

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
