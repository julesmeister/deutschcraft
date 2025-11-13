/**
 * useWebRTCAudio Hook
 * Native WebRTC implementation for voice chat
 * Based on working implementation from alter.gay
 * Uses Firebase Realtime Database for signaling instead of Supabase
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { ref as dbRef, onValue, set, remove, push } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

// ICE servers for NAT/firewall traversal
const ICE_SERVERS = [
  // Google STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Twilio STUN
  { urls: 'stun:global.stun.twilio.com:3478' },
  // OpenRelay TURN servers (public, no auth needed)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

interface AudioParticipant {
  userId: string;
  userName: string;
  isMuted: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface UseWebRTCAudioOptions {
  roomId: string;
  userId: string;
  userName: string;
  onError?: (error: Error) => void;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  retryCount: number;
  lastRetry: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Sanitize userId for Firebase paths (remove invalid characters)
function sanitizeUserId(id: string): string {
  return id.replace(/[.#$[\]@]/g, '_');
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
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());
  const previousRoomIdRef = useRef<string | null>(null);

  // Sanitized userId for Firebase paths
  const sanitizedUserId = sanitizeUserId(userId);

  // Reset state when room changes
  useEffect(() => {
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      console.log('[WebRTC] Room changed, resetting voice state');

      // Clean up previous room inline
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

      // Clean up audio context
      analyserNodesRef.current.clear();
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
  }, [roomId]);

  // Signaling: Listen for other participants
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
            userId: info.originalUserId || id, // Store original userId for display
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

  // Start voice (get microphone access)
  const startVoice = useCallback(async () => {
    try {
      console.log('[WebRTC] Starting voice...');

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

      localStreamRef.current = stream;
      setIsVoiceActive(true);
      setIsMuted(false); // Ensure we start unmuted

      // Make sure audio tracks are enabled
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      // Initialize audio context for monitoring
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Register in Firebase RTDB for signaling
      try {
        const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);
        await set(myParticipantRef, {
          originalUserId: userId, // Store original for reference
          userName,
          isMuted: false,
          timestamp: Date.now(),
        });
        console.log('[WebRTC] Registered in Firebase RTDB');
      } catch (dbError) {
        console.error('[WebRTC] Failed to register in RTDB (database may not be enabled):', dbError);
        // Continue anyway - voice will work locally even if signaling fails
      }

      console.log('[WebRTC] Voice started successfully, unmuted');
    } catch (error) {
      console.error('[WebRTC] Failed to start voice:', error);
      onError?.(error as Error);
    }
  }, [roomId, userId, userName, sanitizedUserId, onError]);

  // Stop voice
  const stopVoice = useCallback(async () => {
    console.log('[WebRTC] Stopping voice...');

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

    // Clean up audio context
    analyserNodesRef.current.clear();
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Remove from Firebase
    const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);
    await remove(myParticipantRef);

    setIsVoiceActive(false);
    setAudioStreams(new Map());

    console.log('[WebRTC] Voice stopped');
  }, [roomId, userId, sanitizedUserId]);

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
      console.log('[WebRTC] Track enabled:', track.enabled, 'track:', track.label);
    });

    setIsMuted(newMutedState);

    // Update in Firebase
    const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);
    await set(myParticipantRef, {
      originalUserId: userId,
      userName,
      isMuted: newMutedState,
      timestamp: Date.now(),
    });

    console.log('[WebRTC] Mute toggled:', newMutedState ? 'MUTED' : 'UNMUTED');
    return newMutedState;
  }, [isMuted, roomId, userId, userName, sanitizedUserId]);

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    async (remoteUserId: string, remoteUserName: string, isInitiator: boolean) => {
      if (!localStreamRef.current) {
        console.log('[WebRTC] No local stream available');
        return;
      }

      // Sanitize remote userId for Firebase paths
      const sanitizedRemoteUserId = sanitizeUserId(remoteUserId);

      // Check if already connected
      if (peerConnectionsRef.current.has(remoteUserId)) {
        console.log('[WebRTC] Already connected to:', remoteUserId);
        return;
      }

      console.log('[WebRTC] Creating peer connection to:', remoteUserName, 'isInitiator:', isInitiator);

      try {
        // Create RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceCandidatePoolSize: 10,
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        });

        // Add local stream tracks
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });

        // Store connection
        peerConnectionsRef.current.set(remoteUserId, {
          pc,
          stream: null,
          retryCount: 0,
          lastRetry: Date.now(),
        });

        // Handle ICE candidates
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            console.log('[WebRTC] Sending ICE candidate to:', remoteUserId);
            const candidateRef = push(
              dbRef(rtdb, `playground_voice/${roomId}/signals/${sanitizedRemoteUserId}/from_${sanitizedUserId}/candidates`)
            );
            await set(candidateRef, {
              candidate: event.candidate.toJSON(),
              timestamp: Date.now(),
            });
          }
        };

        // Handle incoming stream
        pc.ontrack = (event) => {
          console.log('[WebRTC] Received track from:', remoteUserId);
          const [remoteStream] = event.streams;

          if (remoteStream) {
            // Store stream
            const peerConn = peerConnectionsRef.current.get(remoteUserId);
            if (peerConn) {
              peerConn.stream = remoteStream;
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
          }
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
          console.log('[WebRTC] Connection state:', pc.connectionState, 'with:', remoteUserId);

          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            const peerConn = peerConnectionsRef.current.get(remoteUserId);
            if (peerConn && peerConn.retryCount < MAX_RETRIES) {
              // Retry connection
              setTimeout(() => {
                console.log('[WebRTC] Retrying connection to:', remoteUserId);
                peerConnectionsRef.current.delete(remoteUserId);
                createPeerConnection(remoteUserId, remoteUserName, true);
              }, RETRY_DELAY);
            }
          }
        };

        // If initiator, create offer
        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Send offer via Firebase
          const offerRef = dbRef(
            rtdb,
            `playground_voice/${roomId}/signals/${sanitizedRemoteUserId}/from_${sanitizedUserId}/offer`
          );
          await set(offerRef, {
            type: offer.type,
            sdp: offer.sdp,
            timestamp: Date.now(),
          });

          console.log('[WebRTC] Sent offer to:', remoteUserId);
        }

        // Listen for incoming offer
        const offerRef = dbRef(rtdb, `playground_voice/${roomId}/signals/${sanitizedUserId}/from_${sanitizedRemoteUserId}/offer`);
        onValue(offerRef, async (snapshot) => {
          const data = snapshot.val();
          if (!data || !data.sdp) return;

          console.log('[WebRTC] Received offer from:', remoteUserId);

          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          // Send answer
          const answerRef = dbRef(
            rtdb,
            `playground_voice/${roomId}/signals/${sanitizedRemoteUserId}/from_${sanitizedUserId}/answer`
          );
          await set(answerRef, {
            type: answer.type,
            sdp: answer.sdp,
            timestamp: Date.now(),
          });

          console.log('[WebRTC] Sent answer to:', remoteUserId);
        });

        // Listen for answer
        const answerRef = dbRef(rtdb, `playground_voice/${roomId}/signals/${sanitizedUserId}/from_${sanitizedRemoteUserId}/answer`);
        onValue(answerRef, async (snapshot) => {
          const data = snapshot.val();
          if (!data || !data.sdp) return;

          console.log('[WebRTC] Received answer from:', remoteUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
        });

        // Listen for ICE candidates
        const candidatesRef = dbRef(
          rtdb,
          `playground_voice/${roomId}/signals/${sanitizedUserId}/from_${sanitizedRemoteUserId}/candidates`
        );
        onValue(candidatesRef, async (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          Object.values(data).forEach(async (candidateData: any) => {
            if (candidateData.candidate) {
              console.log('[WebRTC] Adding ICE candidate from:', remoteUserId);
              await pc.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
            }
          });
        });
      } catch (error) {
        console.error('[WebRTC] Error creating peer connection:', error);
        peerConnectionsRef.current.delete(remoteUserId);
        onError?.(error as Error);
      }
    },
    [roomId, userId, onError]
  );

  // Connect to new participants
  useEffect(() => {
    if (!isVoiceActive || participants.length === 0) return;

    participants.forEach((participant) => {
      if (!peerConnectionsRef.current.has(participant.userId)) {
        // Initiate connection if our userId is lexicographically smaller
        const isInitiator = userId < participant.userId;
        createPeerConnection(participant.userId, participant.userName, isInitiator);
      }
    });
  }, [participants, isVoiceActive, userId, createPeerConnection]);

  // Cleanup when roomId changes or on unmount
  useEffect(() => {
    return () => {
      // Cleanup when leaving room or component unmounts
      if (localStreamRef.current) {
        console.log('[WebRTC] Cleaning up on room change/unmount');
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
