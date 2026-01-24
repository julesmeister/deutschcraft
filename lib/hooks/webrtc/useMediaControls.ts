/**
 * useMediaControls Hook
 * Handles mute and video toggling with separate stream refs
 */

import { useCallback } from 'react';
import { getVideoStream, setAudioEnabled, setVideoEnabled, stopStream } from './mediaStreamManager';
import { type SignalingSocket, sendPeerStatus } from './socketSignaling';
import type { PeerConnection } from './peerManager';

interface UseMediaControlsProps {
  localAudioStreamRef: React.MutableRefObject<MediaStream | null>;
  localVideoStreamRef: React.MutableRefObject<MediaStream | null>;
  peerConnectionsRef: React.MutableRefObject<Map<string, PeerConnection>>;
  socketRef: React.MutableRefObject<SignalingSocket | null>;
  isMuted: boolean;
  isVideoActive: boolean;
  setIsMuted: (muted: boolean) => void;
  setIsVideoActive: (active: boolean) => void;
  onError?: (error: Error) => void;
}

export function useMediaControls({
  localAudioStreamRef,
  localVideoStreamRef,
  peerConnectionsRef,
  socketRef,
  isMuted,
  isVideoActive,
  setIsMuted,
  setIsVideoActive,
  onError,
}: UseMediaControlsProps) {
  const toggleMute = useCallback(() => {
    if (!localAudioStreamRef.current) return;

    const newMuted = !isMuted;
    setAudioEnabled(localAudioStreamRef.current, !newMuted);
    setIsMuted(newMuted);

    // Notify all peers via socket
    if (socketRef.current?.connected) {
      peerConnectionsRef.current.forEach((_, peerId) => {
        sendPeerStatus(socketRef.current!, peerId, { isMuted: newMuted });
      });
    }
  }, [isMuted, localAudioStreamRef, peerConnectionsRef, socketRef, setIsMuted]);

  const toggleVideo = useCallback(async () => {
    if (!localVideoStreamRef.current) {
      // Start video if none exists
      try {
        const videoStream = await getVideoStream();
        localVideoStreamRef.current = videoStream;
        const newVideoTrack = videoStream.getVideoTracks()[0];

        if (newVideoTrack) {
          // Add or replace video track on all peer connections
          peerConnectionsRef.current.forEach((peer) => {
            const videoTransceiver = peer.pc.getTransceivers().find(
              (t) => t.receiver.track?.kind === 'video' || t.sender.track?.kind === 'video'
            );
            if (videoTransceiver) {
              videoTransceiver.sender.replaceTrack(newVideoTrack);
              videoTransceiver.direction = 'sendrecv';
            } else {
              peer.pc.addTrack(newVideoTrack, videoStream);
            }
          });
        }

        setIsVideoActive(true);

        if (socketRef.current?.connected) {
          peerConnectionsRef.current.forEach((_, peerId) => {
            sendPeerStatus(socketRef.current!, peerId, { isVideoEnabled: true });
          });
        }
        return true;
      } catch (error) {
        console.error('[Media Controls] Failed to start video:', error);
        onError?.(error as Error);
        return false;
      }
    }

    // Toggle existing video
    const newVideoState = !isVideoActive;
    setVideoEnabled(localVideoStreamRef.current, newVideoState);

    if (!newVideoState) {
      // Stopping video: stop tracks and clear ref
      stopStream(localVideoStreamRef.current);
      localVideoStreamRef.current = null;
      // Replace sender track with null
      peerConnectionsRef.current.forEach((peer) => {
        const videoTransceiver = peer.pc.getTransceivers().find(
          (t) => t.sender.track?.kind === 'video'
        );
        if (videoTransceiver) {
          videoTransceiver.sender.replaceTrack(null);
        }
      });
    }

    setIsVideoActive(newVideoState);

    if (socketRef.current?.connected) {
      peerConnectionsRef.current.forEach((_, peerId) => {
        sendPeerStatus(socketRef.current!, peerId, { isVideoEnabled: newVideoState });
      });
    }

    return newVideoState;
  }, [isVideoActive, localVideoStreamRef, peerConnectionsRef, socketRef, setIsVideoActive, onError]);

  return { toggleMute, toggleVideo };
}
