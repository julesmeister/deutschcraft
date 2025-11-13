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
        console.log('[Voice] ✅ Peer connection opened. My peerId:', id);
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
        console.log('[Voice] 📞 Incoming call from:', call.peer);

        if (myStreamRef.current) {
          console.log('[Voice] ✅ Answering call with local stream:', myStreamRef.current);
          console.log('[Voice] Local stream tracks:', myStreamRef.current.getTracks());
          call.answer(myStreamRef.current);

          call.on('stream', (remoteStream) => {
            console.log('[Voice] ✅ Received remote stream from incoming call:', call.peer, remoteStream);
            console.log('[Voice] Remote stream tracks:', remoteStream.getTracks());
            addParticipant(call.peer, remoteStream, call);
            onPeerConnected?.(call.peer, 'Remote User');
          });

          call.on('close', () => {
            console.log('[Voice] Call closed from:', call.peer);
            removeParticipant(call.peer);
            onPeerDisconnected?.(call.peer);
          });

          call.on('error', (err) => {
            console.error('[Voice] ❌ Incoming call error from:', call.peer, err);
          });
        } else {
          console.error('[Voice] ❌ Cannot answer call - no local stream. Call from:', call.peer);
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
      console.log('[Voice] Requesting microphone access...');
      console.log('[Voice] Audio constraints:', AUDIO_CONSTRAINTS);

      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      console.log('[Voice] ✅ Got microphone stream:', stream);
      console.log('[Voice] Stream ID:', stream.id);
      console.log('[Voice] Stream tracks:', stream.getTracks());
      console.log('[Voice] Audio tracks:', stream.getAudioTracks());

      myStreamRef.current = stream;
      setIsVoiceActive(true);

      // Add own stream to voiceStreams for audio detection
      setVoiceStreams((prev) => {
        const updated = new Map(prev);
        updated.set(userId, stream);
        console.log('[Voice] Added own stream to voiceStreams. Total streams:', updated.size);
        return updated;
      });

      console.log('[Voice] ✅ Voice started successfully');
    } catch (error) {
      console.error('[Voice] ❌ Failed to get microphone:', error);
      console.error('[Voice] Error name:', (error as Error).name);
      console.error('[Voice] Error message:', (error as Error).message);
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
        console.log('[Voice] Skipping connectToPeer:', {
          hasPeer: !!peerRef.current,
          hasStream: !!myStreamRef.current,
          sameId: peerId === myPeerId,
          peerId,
          myPeerId,
        });
        return;
      }

      // Check if already connected to this peer
      if (participantsRef.current.has(peerId)) {
        console.log('[Voice] Already connected to peer:', peerId);
        return;
      }

      console.log('[Voice] Calling peer:', peerId, 'for user:', targetUserName);

      try {
        const call = peerRef.current.call(peerId, myStreamRef.current);
        if (!call) {
          console.error('[Voice] Failed to create call to:', peerId);
          return;
        }

        console.log('[Voice] Call object created successfully:', call);

        call.on('stream', (remoteStream) => {
          console.log('[Voice] ✅ Received stream from outgoing call:', peerId, remoteStream);
          console.log('[Voice] Stream tracks:', remoteStream.getTracks());
          addParticipant(peerId, remoteStream, call, targetUserId, targetUserName);
          onPeerConnected?.(peerId, targetUserName);
        });

        call.on('close', () => {
          console.log('[Voice] Outgoing call closed:', peerId);
          removeParticipant(peerId);
          onPeerDisconnected?.(peerId);
        });

        call.on('error', (err) => {
          console.error('[Voice] ❌ Outgoing call error:', peerId, err);
          removeParticipant(peerId);
        });

        // Add a timeout to detect if stream never arrives
        setTimeout(() => {
          if (!participantsRef.current.has(peerId)) {
            console.error('[Voice] ⚠️ Timeout: No stream received from', peerId, 'after 5 seconds');
          }
        }, 5000);
      } catch (err) {
        console.error('[Voice] ❌ Exception calling peer:', peerId, err);
      }
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
    console.log('[Voice] Adding participant:', { peerId, userId, userName, stream });

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
      console.log('[Voice] Updated voiceStreams. Total streams:', updated.size);
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
