/**
 * useMediaSession Hook
 * Handles starting and stopping WebRTC media sessions
 */

import { useCallback, useRef } from "react";
import {
  registerParticipant,
  unregisterParticipant,
  listenForSignals,
  listenForParticipants,
  sendOffer,
  type SignalMessage,
} from "./firebaseSignaling";
import { getMediaStream, enableAllTracks } from "./mediaStreamManager";
import type { MediaParticipant } from "./types";

interface UseMediaSessionProps {
  roomId: string;
  userId: string;
  userName: string;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  signalUnsubscribeRef: React.MutableRefObject<(() => void) | null>;
  participantsUnsubscribeRef: React.MutableRefObject<(() => void) | null>;
  isMediaActiveRef: React.MutableRefObject<boolean>;
  peerConnectionsRef: React.MutableRefObject<Map<string, any>>;
  setIsVoiceActive: (active: boolean) => void;
  setIsVideoActive: (active: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setParticipants: (participants: MediaParticipant[]) => void;
  handleSignal: (signal: SignalMessage) => Promise<void>;
  createPeer: (remoteUserId: string) => RTCPeerConnection;
  cleanup: () => void;
  onError?: (error: Error) => void;
}

export function useMediaSession({
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
}: UseMediaSessionProps) {
  const isRequestingRef = useRef<boolean>(false);

  // Start media (voice and optionally video)
  const startMedia = useCallback(
    async (withVideo: boolean = false) => {
      try {
        console.log("[Media Session] Starting media...", {
          roomId,
          userId,
          userName,
          withVideo,
        });

        if (!roomId || !userId) {
          throw new Error("No room ID or user ID provided");
        }

        // Stop existing stream if any to prevent "Device in use" errors
        if (localStreamRef.current) {
          console.log(
            "[Media Session] Stopping existing stream before starting new one"
          );
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }

        const stream = await getMediaStream(withVideo);

        localStreamRef.current = stream;
        setIsVoiceActive(true);
        setIsVideoActive(withVideo);
        setIsMuted(false);
        isMediaActiveRef.current = true;

        enableAllTracks(stream, true);

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        // Set up listeners BEFORE registering - ensures we receive offers
        // triggered by our registration announcement
        signalUnsubscribeRef.current = listenForSignals(
          roomId,
          userId,
          handleSignal
        );

        participantsUnsubscribeRef.current = listenForParticipants(
          roomId,
          userId,
          (participants) => {
            setParticipants(
              participants.map((p) => ({ ...p, isVideoEnabled: false }))
            );

            participants.forEach((participant) => {
              const shouldInitiate = userId < participant.userId;
              const alreadyConnected = peerConnectionsRef.current.has(participant.userId);
              if (shouldInitiate && !alreadyConnected) {
                setTimeout(async () => {
                  // Double-check after timeout to avoid race with signal handler
                  if (peerConnectionsRef.current.has(participant.userId)) return;
                  const pc = createPeer(participant.userId);
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  await sendOffer(roomId, userId, participant.userId, offer);
                }, Math.random() * 1000);
              }
            });
          }
        );

        // Register AFTER listeners are set up - other users' responses will be caught
        await registerParticipant(roomId, userId, userName, false);

        console.log("[Media Session] ✅ Media started successfully");
      } catch (error) {
        console.error("[Media Session] ❌ Failed to start media:", error);
        setIsVoiceActive(false);
        setIsVideoActive(false);
        onError?.(error as Error);
        throw error;
      }
    },
    [
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
      onError,
    ]
  );

  const startVoice = useCallback(async () => {
    await startMedia(false);
  }, [startMedia]);

  const startVideo = useCallback(async () => {
    await startMedia(true);
  }, [startMedia]);

  const stopMedia = useCallback(async () => {
    console.log("[Media Session] Stopping media...");

    // Stop tracks immediately to free hardware resources
    // This must happen BEFORE any async network calls
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      // We don't null it here, cleanup() will do that, but tracks are stopped
    }

    if (roomId && userId) {
      await unregisterParticipant(roomId, userId);
    }
    cleanup();
    isMediaActiveRef.current = false;
  }, [roomId, userId, cleanup, isMediaActiveRef]);

  const stopVoice = useCallback(async () => {
    await stopMedia();
  }, [stopMedia]);

  const stopVideo = useCallback(async () => {
    await stopMedia();
  }, [stopMedia]);

  return { startVoice, startVideo, stopVoice, stopVideo, stopMedia };
}
