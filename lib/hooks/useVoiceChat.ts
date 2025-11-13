/**
 * useVoiceChat Hook
 * Manages PeerJS voice connections for the Playground
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { PEER_CONFIG, generatePeerId, AUDIO_CONSTRAINTS } from '@/lib/config/peerjs';

interface VoiceParticipant {
  peerId: string;
  userId: string;
  userName: string;
  stream?: MediaStream;
  connection?: MediaConnection;
}

interface UseVoiceChatOptions {
  userId: string;
  userName: string;
  roomId: string;
  onPeerConnected?: (peerId: string, userName: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onError?: (error: Error) => void;
}

interface UseVoiceChatReturn {
  myPeerId: string | null;
  isConnected: boolean;
  isMuted: boolean;
  isVoiceActive: boolean;
  participants: VoiceParticipant[];
  voiceStreams: Map<string, MediaStream>;
  startVoice: () => Promise<void>;
  stopVoice: () => void;
  toggleMute: () => void;
  connectToPeer: (peerId: string, userId: string, userName: string) => void;
}

export function useVoiceChat({
  userId,
  userName,
  roomId,
  onPeerConnected,
  onPeerDisconnected,
  onError,
}: UseVoiceChatOptions): UseVoiceChatReturn {
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const myStreamRef = useRef<MediaStream | null>(null);
  const participantsRef = useRef<Map<string, VoiceParticipant>>(new Map());
  const [voiceStreams, setVoiceStreams] = useState<Map<string, MediaStream>>(new Map());

  // Initialize PeerJS
  useEffect(() => {
    // Don't initialize if no valid roomId
    if (!roomId || roomId.trim() === '') {
      return;
    }

    const peerId = generatePeerId(userId, roomId);
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    try {
      const peer = new Peer(peerId, PEER_CONFIG);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setMyPeerId(id);
        setIsConnected(true);
        reconnectAttempts = 0;
      });

      peer.on('error', (error) => {
        // Prevent infinite reconnection loops
        if (reconnectAttempts >= maxReconnectAttempts) {
          setIsConnected(false);
          onError?.(new Error('Failed to connect to voice server after multiple attempts'));
          return;
        }

        reconnectAttempts++;
        onError?.(error as Error);
      });

      peer.on('disconnected', () => {
        setIsConnected(false);
      });

      // Handle incoming calls
      peer.on('call', (call) => {
        if (myStreamRef.current) {
          call.answer(myStreamRef.current);

          call.on('stream', (remoteStream) => {
            addParticipant(call.peer, remoteStream, call);
            onPeerConnected?.(call.peer, 'Remote User');
          });

          call.on('close', () => {
            removeParticipant(call.peer);
            onPeerDisconnected?.(call.peer);
          });
        }
      });

      return () => {
        if (peer && !peer.destroyed) {
          peer.destroy();
        }
      };
    } catch (error) {
      onError?.(error as Error);
    }
  }, [userId, roomId, onPeerConnected, onPeerDisconnected, onError]);

  // Start voice (get microphone access)
  const startVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      myStreamRef.current = stream;
      setIsVoiceActive(true);

      // Add own stream to voiceStreams for audio detection
      setVoiceStreams((prev) => {
        const updated = new Map(prev);
        updated.set(userId, stream);
        return updated;
      });
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [onError, userId]);

  // Stop voice (release microphone)
  const stopVoice = useCallback(() => {
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((track) => track.stop());
      myStreamRef.current = null;
    }

    participantsRef.current.forEach((participant) => {
      participant.connection?.close();
    });
    participantsRef.current.clear();
    setParticipants([]);
    setIsVoiceActive(false);

    // Clear own stream from voiceStreams
    setVoiceStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
  }, [userId]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (myStreamRef.current) {
      const audioTracks = myStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioTracks[0].enabled);
    }
  }, []);

  // Connect to a peer
  const connectToPeer = useCallback(
    (peerId: string, targetUserId: string, targetUserName: string) => {
      if (!peerRef.current || !myStreamRef.current || peerId === myPeerId) {
        return;
      }

      const call = peerRef.current.call(peerId, myStreamRef.current);
      if (!call) return;

      call.on('stream', (remoteStream) => {
        addParticipant(peerId, remoteStream, call, targetUserId, targetUserName);
        onPeerConnected?.(peerId, targetUserName);
      });

      call.on('close', () => {
        removeParticipant(peerId);
        onPeerDisconnected?.(peerId);
      });

      call.on('error', () => {
        removeParticipant(peerId);
      });
    },
    [myPeerId, onPeerConnected, onPeerDisconnected]
  );

  // Add participant
  const addParticipant = (
    peerId: string,
    stream: MediaStream,
    connection: MediaConnection,
    userId?: string,
    userName?: string
  ) => {
    const participant: VoiceParticipant = {
      peerId,
      userId: userId || peerId,
      userName: userName || 'Unknown',
      stream,
      connection,
    };

    participantsRef.current.set(peerId, participant);
    setParticipants(Array.from(participantsRef.current.values()));

    // Update voice streams map
    const userIdKey = userId || peerId;
    setVoiceStreams((prev) => {
      const updated = new Map(prev);
      updated.set(userIdKey, stream);
      return updated;
    });
  };

  // Remove participant
  const removeParticipant = (peerId: string) => {
    const participant = participantsRef.current.get(peerId);
    if (participant) {
      participant.stream?.getTracks().forEach((track) => track.stop());
      participant.connection?.close();
      participantsRef.current.delete(peerId);
      setParticipants(Array.from(participantsRef.current.values()));

      // Remove from voice streams
      const userIdKey = participant.userId;
      setVoiceStreams((prev) => {
        const updated = new Map(prev);
        updated.delete(userIdKey);
        return updated;
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
    };
  }, [stopVoice]);

  return {
    myPeerId,
    isConnected,
    isMuted,
    isVoiceActive,
    participants,
    voiceStreams,
    startVoice,
    stopVoice,
    toggleMute,
    connectToPeer,
  };
}
