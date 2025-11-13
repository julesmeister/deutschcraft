/**
 * usePeerConnection Hook
 * Manages individual WebRTC peer connections
 */

import { useCallback, useRef } from 'react';
import { ICE_SERVERS } from './config';
import { sendOffer, sendAnswer, sendIceCandidate, listenForOffer, listenForAnswer, listenForIceCandidates } from './signaling';
import type { PeerConnection, MAX_RETRIES, RETRY_DELAY } from './types';

interface UsePeerConnectionOptions {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

export function usePeerConnection({
  roomId,
  userId,
  localStream,
  onRemoteStream,
  onError,
}: UsePeerConnectionOptions) {
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());

  const createPeerConnection = useCallback(
    async (remoteUserId: string, remoteUserName: string, isInitiator: boolean) => {
      if (!localStream) {
        console.log('[WebRTC] No local stream available');
        return;
      }

      if (peerConnectionsRef.current.has(remoteUserId)) {
        console.log('[WebRTC] Already connected to:', remoteUserId);
        return;
      }

      console.log('[WebRTC] Creating peer connection to:', remoteUserName, 'isInitiator:', isInitiator);

      try {
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceCandidatePoolSize: 10,
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        });

        // Add local stream tracks
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
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
            await sendIceCandidate(roomId, userId, remoteUserId, event.candidate.toJSON());
          }
        };

        // Handle incoming stream
        pc.ontrack = (event) => {
          console.log('[WebRTC] Received track from:', remoteUserId);
          const [remoteStream] = event.streams;

          if (remoteStream) {
            const peerConn = peerConnectionsRef.current.get(remoteUserId);
            if (peerConn) {
              peerConn.stream = remoteStream;
            }

            onRemoteStream(remoteUserId, remoteStream);

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
            if (peerConn && peerConn.retryCount < 3) {
              setTimeout(() => {
                console.log('[WebRTC] Retrying connection to:', remoteUserId);
                peerConnectionsRef.current.delete(remoteUserId);
                createPeerConnection(remoteUserId, remoteUserName, true);
              }, 2000);
            }
          }
        };

        // If initiator, create offer
        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendOffer(roomId, userId, remoteUserId, offer);
          console.log('[WebRTC] Sent offer to:', remoteUserId);
        }

        // Listen for incoming offer
        listenForOffer(roomId, userId, remoteUserId, async (data) => {
          console.log('[WebRTC] Received offer from:', remoteUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendAnswer(roomId, userId, remoteUserId, answer);
          console.log('[WebRTC] Sent answer to:', remoteUserId);
        });

        // Listen for answer
        listenForAnswer(roomId, userId, remoteUserId, async (data) => {
          console.log('[WebRTC] Received answer from:', remoteUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
        });

        // Listen for ICE candidates
        listenForIceCandidates(roomId, userId, remoteUserId, async (candidate) => {
          console.log('[WebRTC] Adding ICE candidate from:', remoteUserId);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
      } catch (error) {
        console.error('[WebRTC] Error creating peer connection:', error);
        peerConnectionsRef.current.delete(remoteUserId);
        onError?.(error as Error);
      }
    },
    [roomId, userId, localStream, onRemoteStream, onError]
  );

  const closeAllConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((peer) => {
      peer.pc.close();
      if (peer.stream) {
        peer.stream.getTracks().forEach((track) => track.stop());
      }
    });
    peerConnectionsRef.current.clear();
  }, []);

  return {
    createPeerConnection,
    closeAllConnections,
  };
}
