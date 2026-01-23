/**
 * useWebRTCMedia Hook (v2 - Modular)
 * Simplified WebRTC implementation using modular peer and signal management
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  createPeerConnection,
  setupAudioPlayback,
  cleanupPeerConnection,
  type PeerConnection,
} from "./webrtc/peerManager";
import { createSignalHandler } from "./webrtc/signalHandler";
import { sendOffer } from "./webrtc/firebaseSignaling";
import { useMediaSession } from "./webrtc/useMediaSession";
import { useMediaControls } from "./webrtc/useMediaControls";
import type { MediaParticipant, UseWebRTCMediaOptions } from "./webrtc/types";

export function useWebRTCMedia({
  roomId,
  userId,
  userName,
  enableVideo = false,
  onError,
}: UseWebRTCMediaOptions) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<MediaParticipant[]>([]);
  const [audioStreams, setAudioStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [videoStreams, setVideoStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [audioAnalysers, setAudioAnalysers] = useState<
    Map<string, AnalyserNode>
  >(new Map());
  const [audioElements, setAudioElements] = useState<
    Map<string, HTMLAudioElement>
  >(new Map());

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousRoomIdRef = useRef<string | null>(null);
  const signalUnsubscribeRef = useRef<(() => void) | null>(null);
  const participantsUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMediaActiveRef = useRef<boolean>(false);

  // Reset state when room changes
  useEffect(() => {
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      console.log("[WebRTC Media] Room changed, resetting state");
      cleanup();
    }
    previousRoomIdRef.current = roomId;
  }, [roomId]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peerConnectionsRef.current.forEach((peer) => {
      cleanupPeerConnection(peer);
    });
    peerConnectionsRef.current.clear();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (signalUnsubscribeRef.current) {
      signalUnsubscribeRef.current();
      signalUnsubscribeRef.current = null;
    }

    if (participantsUnsubscribeRef.current) {
      participantsUnsubscribeRef.current();
      participantsUnsubscribeRef.current = null;
    }

    setIsVoiceActive(false);
    setIsVideoActive(false);
    setIsMuted(false);
    setParticipants([]);
    setAudioStreams(new Map());
    setVideoStreams(new Map());
    setAudioAnalysers(new Map());
    isMediaActiveRef.current = false;
  }, []);

  // Handle received track
  const handleTrackReceived = useCallback(
    (
      remoteUserId: string,
      stream: MediaStream,
      hasAudio: boolean,
      hasVideo: boolean,
    ) => {
      const peer = peerConnectionsRef.current.get(remoteUserId);
      if (!peer) return;

      peer.stream = stream;

      if (hasAudio) {
        setAudioStreams((prev) => {
          const updated = new Map(prev);
          updated.set(remoteUserId, stream);
          return updated;
        });

        const audioSetup = setupAudioPlayback(stream, audioContextRef.current);
        peer.audioElement = audioSetup.audioElement;
        peer.source = audioSetup.source;
        peer.analyser = audioSetup.analyser;
        peer.gainNode = audioSetup.gainNode;

        setAudioElements((prev) => {
          const updated = new Map(prev);
          updated.set(remoteUserId, audioSetup.audioElement);
          return updated;
        });

        if (audioSetup.analyser) {
          setAudioAnalysers((prev) => {
            const updated = new Map(prev);
            updated.set(remoteUserId, audioSetup.analyser!);
            return updated;
          });
        }
      }

      if (hasVideo) {
        setVideoStreams((prev) => {
          const updated = new Map(prev);
          updated.set(remoteUserId, stream);
          return updated;
        });
      }
    },
    [],
  );

  // Handle connection state change
  const handleConnectionStateChange = useCallback(
    (remoteUserId: string, state: RTCPeerConnectionState) => {
      if (state === "failed") {
        console.error("[WebRTC Media] Connection failed:", remoteUserId);
        peerConnectionsRef.current.delete(remoteUserId);

        setAudioStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(remoteUserId);
          return updated;
        });

        setVideoStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(remoteUserId);
          return updated;
        });

        setAudioAnalysers((prev) => {
          const updated = new Map(prev);
          updated.delete(remoteUserId);
          return updated;
        });
      } else if (state === "disconnected") {
        // Disconnected is often temporary - wait before cleaning up
        console.warn(
          "[WebRTC Media] Connection disconnected (may recover):",
          remoteUserId,
        );
        setTimeout(() => {
          const peer = peerConnectionsRef.current.get(remoteUserId);
          if (peer && peer.pc.connectionState === "disconnected") {
            console.error(
              "[WebRTC Media] Connection did not recover, cleaning up:",
              remoteUserId,
            );
            peerConnectionsRef.current.delete(remoteUserId);

            setAudioStreams((prev) => {
              const updated = new Map(prev);
              updated.delete(remoteUserId);
              return updated;
            });

            setVideoStreams((prev) => {
              const updated = new Map(prev);
              updated.delete(remoteUserId);
              return updated;
            });

            setAudioAnalysers((prev) => {
              const updated = new Map(prev);
              updated.delete(remoteUserId);
              return updated;
            });
          }
        }, 5000);
      }
    },
    [],
  );

  // Handle renegotiation (when tracks are added after connection)
  const handleNegotiationNeeded = useCallback(
    (remoteUserId: string, offer: RTCSessionDescriptionInit) => {
      console.log(
        "[WebRTC Media] Sending renegotiation offer to:",
        remoteUserId,
      );
      sendOffer(roomId, userId, remoteUserId, offer);
    },
    [roomId, userId],
  );

  // Create peer connection helper
  const createPeer = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      const pc = createPeerConnection({
        roomId,
        userId,
        remoteUserId,
        localStream: localStreamRef.current,
        audioContext: audioContextRef.current,
        onTrackReceived: handleTrackReceived,
        onConnectionStateChange: handleConnectionStateChange,
        onNegotiationNeeded: handleNegotiationNeeded,
      });

      peerConnectionsRef.current.set(remoteUserId, { pc, stream: null });
      return pc;
    },
    [
      roomId,
      userId,
      handleTrackReceived,
      handleConnectionStateChange,
      handleNegotiationNeeded,
    ],
  );

  // Handle peer disconnected
  const onPeerDisconnected = useCallback((userId: string) => {
    setAudioStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });

    setVideoStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });

    setAudioAnalysers((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
  }, []);

  // Handle incoming signals
  const handleSignal = useMemo(
    () =>
      createSignalHandler({
        roomId,
        userId,
        isMediaActiveRef,
        peerConnectionsRef,
        createPeer,
        onPeerDisconnected,
      }),
    [roomId, userId, createPeer, onPeerDisconnected],
  );

  // Media session controls
  const { startVoice, startVideo, stopVoice, stopVideo, stopMedia } =
    useMediaSession({
      roomId,
      userId,
      userName,
      localStreamRef,
      audioContextRef,
      signalUnsubscribeRef,
      participantsUnsubscribeRef,
      isMediaActiveRef,
      peerConnectionsRef,
      setIsVoiceActive,
      setIsVideoActive,
      setIsMuted,
      setParticipants,
      handleSignal,
      createPeer,
      cleanup,
      onError,
    });

  // Media controls (mute/video toggle)
  const { toggleMute, toggleVideo } = useMediaControls({
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
  });

  const getLocalStream = useCallback(() => {
    return localStreamRef.current;
  }, []);

  useEffect(() => {
    return () => {
      // Synchronously stop all tracks immediately to release hardware lock
      // This is critical for Fast Refresh / Page Reloads where async cleanup is too slow
      const hadStream = !!localStreamRef.current;

      if (localStreamRef.current) {
        console.log(
          "[WebRTC Media] Unmounting - releasing hardware immediately",
        );
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (hadStream) {
        stopMedia();
      }
    };
  }, [stopMedia]);

  return {
    isVoiceActive,
    isVideoActive,
    isMuted,
    participants,
    audioStreams,
    videoStreams,
    audioAnalysers,
    audioElements,
    localStream: getLocalStream(),
    startVoice,
    startVideo,
    stopVoice,
    stopVideo,
    stopMedia,
    toggleMute,
    toggleVideo,
  };
}
