/**
 * useWebRTCMedia Hook (v3 - WebSocket + Separate Streams)
 * Orchestrates WebRTC with Durable Object signaling and independent audio/video streams
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createPeerConnection,
  setupAudioPlayback,
  cleanupPeerConnection,
  type PeerConnection,
} from './webrtc/peerManager';
import {
  createSignalingSocket,
  registerCallbacks,
  unregisterCallbacks,
  relaySDP,
  relayICE,
  type SignalingSocket,
  type PeerStatusUpdate,
} from './webrtc/socketSignaling';
import { stopStream } from './webrtc/mediaStreamManager';
import { useMediaSession } from './webrtc/useMediaSession';
import { useMediaControls } from './webrtc/useMediaControls';
import type { MediaParticipant, UseWebRTCMediaOptions } from './webrtc/types';

export function useWebRTCMedia({
  roomId,
  userId,
  userName,
  onError,
}: UseWebRTCMediaOptions) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<MediaParticipant[]>([]);
  const [audioStreams, setAudioStreams] = useState<Map<string, MediaStream>>(new Map());
  const [videoStreams, setVideoStreams] = useState<Map<string, MediaStream>>(new Map());
  const [audioAnalysers, setAudioAnalysers] = useState<Map<string, AnalyserNode>>(new Map());
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  const localAudioStreamRef = useRef<MediaStream | null>(null);
  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<{ analyser: AnalyserNode; source: MediaStreamAudioSourceNode } | null>(null);
  const socketRef = useRef<SignalingSocket | null>(null);
  const isMediaActiveRef = useRef<boolean>(false);
  const previousRoomIdRef = useRef<string | null>(null);

  // Cleanup all peer connections and state
  const cleanup = useCallback(() => {
    peerConnectionsRef.current.forEach((peer) => cleanupPeerConnection(peer));
    peerConnectionsRef.current.clear();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsVoiceActive(false);
    setIsVideoActive(false);
    setIsMuted(false);
    setParticipants([]);
    setAudioStreams(new Map());
    setVideoStreams(new Map());
    setAudioAnalysers(new Map());
    setAudioElements(new Map());
    isMediaActiveRef.current = false;
  }, []);

  // Create a peer connection for a remote user
  const createPeer = useCallback((remoteUserId: string): RTCPeerConnection => {
    const pc = createPeerConnection({
      remoteUserId,
      localAudioStream: localAudioStreamRef.current,
      localVideoStream: localVideoStreamRef.current,
      audioContext: audioContextRef.current,
      onAudioTrack: (peerId, stream) => {
        const peer = peerConnectionsRef.current.get(peerId);
        if (peer) peer.audioStream = stream;

        setAudioStreams(prev => { const m = new Map(prev); m.set(peerId, stream); return m; });

        const audioSetup = setupAudioPlayback(stream, audioContextRef.current);
        if (peer) {
          peer.audioElement = audioSetup.audioElement;
          peer.source = audioSetup.source;
          peer.analyser = audioSetup.analyser;
          peer.gainNode = audioSetup.gainNode;
        }

        setAudioElements(prev => { const m = new Map(prev); m.set(peerId, audioSetup.audioElement); return m; });
        if (audioSetup.analyser) {
          setAudioAnalysers(prev => { const m = new Map(prev); m.set(peerId, audioSetup.analyser!); return m; });
        }
      },
      onVideoTrack: (peerId, stream) => {
        const peer = peerConnectionsRef.current.get(peerId);
        if (peer) peer.videoStream = stream;
        setVideoStreams(prev => { const m = new Map(prev); m.set(peerId, stream); return m; });
      },
      onConnectionStateChange: (peerId, state) => {
        if (state === 'failed' || state === 'closed') {
          const peer = peerConnectionsRef.current.get(peerId);
          if (peer) cleanupPeerConnection(peer);
          peerConnectionsRef.current.delete(peerId);
          removePeerFromState(peerId);
        } else if (state === 'disconnected') {
          setTimeout(() => {
            const peer = peerConnectionsRef.current.get(peerId);
            if (peer && peer.pc.connectionState === 'disconnected') {
              cleanupPeerConnection(peer);
              peerConnectionsRef.current.delete(peerId);
              removePeerFromState(peerId);
            }
          }, 5000);
        }
      },
      onIceCandidate: (peerId, candidate) => {
        if (socketRef.current) {
          relayICE(socketRef.current, peerId, candidate);
        }
      },
      onNegotiationNeeded: (peerId, offer) => {
        if (socketRef.current) {
          relaySDP(socketRef.current, peerId, offer);
        }
      },
    });

    peerConnectionsRef.current.set(remoteUserId, { pc, audioStream: null, videoStream: null });
    return pc;
  }, []);

  const removePeerFromState = useCallback((peerId: string) => {
    setAudioStreams(prev => { const m = new Map(prev); m.delete(peerId); return m; });
    setVideoStreams(prev => { const m = new Map(prev); m.delete(peerId); return m; });
    setAudioAnalysers(prev => { const m = new Map(prev); m.delete(peerId); return m; });
    setAudioElements(prev => { const m = new Map(prev); m.delete(peerId); return m; });
    setParticipants(prev => prev.filter(p => p.userId !== peerId));
  }, []);

  // Signaling event handlers
  const handleAddPeer = useCallback(async (peerId: string, peerName: string, shouldCreateOffer: boolean) => {
    console.log('[MEDIA] addPeer', peerId, peerName, 'offer:', shouldCreateOffer);

    // If a connection already exists (e.g. peer reconnected after refresh),
    // clean it up first so we can establish a fresh connection
    if (peerConnectionsRef.current.has(peerId)) {
      console.log('[MEDIA] cleaning up stale connection for', peerId);
      const stalePeer = peerConnectionsRef.current.get(peerId)!;
      cleanupPeerConnection(stalePeer);
      peerConnectionsRef.current.delete(peerId);
      removePeerFromState(peerId);
    }

    // Add to participants
    setParticipants(prev => {
      if (prev.find(p => p.userId === peerId)) return prev;
      return [...prev, {
        userId: peerId,
        userName: peerName,
        isMuted: false,
        isVideoEnabled: false,
        audioLevel: 0,
        connectionQuality: 'good' as const,
      }];
    });

    // Only create the peer connection for the offerer side.
    // The non-offerer's peer is created lazily when the offer SDP arrives
    // (in handleSessionDescription), avoiding onnegotiationneeded glare.
    if (shouldCreateOffer) {
      const pc = createPeer(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('[MEDIA] created offer for', peerId, '→ sending SDP');
        if (socketRef.current) {
          relaySDP(socketRef.current, peerId, offer);
        }
      } catch (error) {
        console.error('[MEDIA] Failed to create offer for', peerId, error);
      }
    }
  }, [createPeer]);

  const handleRemovePeer = useCallback((peerId: string) => {
    const peer = peerConnectionsRef.current.get(peerId);
    if (peer) {
      cleanupPeerConnection(peer);
      peerConnectionsRef.current.delete(peerId);
    }
    removePeerFromState(peerId);
  }, [removePeerFromState]);

  const handleSessionDescription = useCallback(async (peerId: string, sdp: RTCSessionDescriptionInit) => {
    console.log('[MEDIA] received SDP', sdp.type, 'from', peerId, 'current state:', peerConnectionsRef.current.get(peerId)?.pc.signalingState);
    let peer = peerConnectionsRef.current.get(peerId);

    if (!peer) {
      createPeer(peerId);
      peer = peerConnectionsRef.current.get(peerId);
    }

    if (!peer) return;

    const signalingState = peer.pc.signalingState;

    // Check if we can accept this SDP based on current state
    if (sdp.type === 'answer' && signalingState !== 'have-local-offer') {
      console.log('[MEDIA] Ignoring answer - not in have-local-offer state (current:', signalingState, ')');
      return;
    }

    if (sdp.type === 'offer' && signalingState !== 'stable') {
      console.log('[MEDIA] Ignoring offer - not in stable state (current:', signalingState, ')');
      return;
    }

    try {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('[MEDIA] setRemoteDescription OK for', peerId);

      if (sdp.type === 'offer') {
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        console.log('[MEDIA] created answer for', peerId, '→ sending SDP');
        if (socketRef.current) {
          relaySDP(socketRef.current, peerId, answer);
        }
      }
    } catch (error) {
      console.error('[MEDIA] SDP handling failed for', peerId, error);
    }
  }, [createPeer]);

  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const peer = peerConnectionsRef.current.get(peerId);
    if (!peer) return;

    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      // ICE candidates before remote description are common - queue retry
      setTimeout(async () => {
        try {
          const p = peerConnectionsRef.current.get(peerId);
          if (p) await p.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch { /* ignore late candidates */ }
      }, 200);
    }
  }, []);

  const handlePeerStatus = useCallback((peerId: string, status: PeerStatusUpdate) => {
    setParticipants(prev => prev.map(p => {
      if (p.userId !== peerId) return p;
      return {
        ...p,
        ...(status.isMuted !== undefined && { isMuted: status.isMuted }),
        ...(status.isVideoEnabled !== undefined && { isVideoEnabled: status.isVideoEnabled }),
      };
    }));
  }, []);

  // WebSocket connection lifecycle
  useEffect(() => {
    if (!roomId || !userId) return;

    const socket = createSignalingSocket(roomId);
    socketRef.current = socket;

    registerCallbacks(socket, {
      onAddPeer: handleAddPeer,
      onRemovePeer: handleRemovePeer,
      onSessionDescription: handleSessionDescription,
      onIceCandidate: handleIceCandidate,
      onPeerStatus: handlePeerStatus,
    });

    socket.connect();

    return () => {
      unregisterCallbacks(socket);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userId, handleAddPeer, handleRemovePeer, handleSessionDescription, handleIceCandidate, handlePeerStatus]);

  // Room change detection
  useEffect(() => {
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      stopStream(localAudioStreamRef.current);
      stopStream(localVideoStreamRef.current);
      localAudioStreamRef.current = null;
      localVideoStreamRef.current = null;
      cleanup();
    }
    previousRoomIdRef.current = roomId;
  }, [roomId, cleanup]);

  // Media session controls
  const { startVoice, startVideo, stopVoice, stopVideo, stopMedia } = useMediaSession({
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
  });

  // Media controls
  const { toggleMute, toggleVideo } = useMediaControls({
    localAudioStreamRef,
    localVideoStreamRef,
    peerConnectionsRef,
    socketRef,
    isMuted,
    isVideoActive,
    setIsMuted,
    setIsVideoActive,
    onError,
  });

  // Create a local analyser so the current user sees their own audio waves
  useEffect(() => {
    if (!isVoiceActive || !userId) return;
    let cancelled = false;

    // Poll until local audio stream and AudioContext are ready
    const tryCreate = () => {
      if (cancelled) return;
      const stream = localAudioStreamRef.current;
      const ctx = audioContextRef.current;
      if (!stream || !ctx || stream.getAudioTracks().length === 0) {
        // Retry in 100ms
        setTimeout(tryCreate, 100);
        return;
      }

      try {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        // Don't connect to destination — we don't want to hear ourselves

        localAnalyserRef.current = { analyser, source };
        setAudioAnalysers(prev => { const m = new Map(prev); m.set(userId, analyser); return m; });
        console.log('[MEDIA] Local analyser created for', userId);
      } catch (e) {
        console.error('[MEDIA] Failed to create local analyser:', e);
      }
    };

    tryCreate();

    return () => {
      cancelled = true;
      if (localAnalyserRef.current) {
        try { localAnalyserRef.current.source.disconnect(); } catch {}
        localAnalyserRef.current = null;
      }
      setAudioAnalysers(prev => { const m = new Map(prev); m.delete(userId); return m; });
    };
  }, [isVoiceActive, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream(localAudioStreamRef.current);
      stopStream(localVideoStreamRef.current);
      localAudioStreamRef.current = null;
      localVideoStreamRef.current = null;
      cleanup();
    };
  }, [cleanup]);

  return {
    isVoiceActive,
    isVideoActive,
    isMuted,
    participants,
    audioStreams,
    videoStreams,
    audioAnalysers,
    audioElements,
    localStream: localVideoStreamRef.current || localAudioStreamRef.current,
    startVoice,
    startVideo,
    stopVoice,
    stopVideo,
    stopMedia,
    toggleMute,
    toggleVideo,
  };
}
