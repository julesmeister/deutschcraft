/**
 * WebRTC Signal Handler
 * Processes incoming WebRTC signaling messages
 */

import { sendOffer, sendAnswer } from './firebaseSignaling';
import type { SignalMessage } from './firebaseSignaling';
import { cleanupPeerConnection, type PeerConnection } from './peerManager';

export interface SignalHandlerOptions {
  roomId: string;
  userId: string;
  isMediaActiveRef: React.MutableRefObject<boolean>;
  peerConnectionsRef: React.MutableRefObject<Map<string, PeerConnection>>;
  createPeer: (remoteUserId: string) => RTCPeerConnection;
  onPeerDisconnected: (userId: string) => void;
}

export function createSignalHandler({
  roomId,
  userId,
  isMediaActiveRef,
  peerConnectionsRef,
  createPeer,
  onPeerDisconnected,
}: SignalHandlerOptions) {
  return async (signal: SignalMessage) => {
    const { type, fromUserId, data } = signal;

    console.log('[WebRTC Signal] Processing:', type, 'from:', fromUserId);

    try {
      let peer = peerConnectionsRef.current.get(fromUserId);
      if (!peer) {
        const pc = createPeer(fromUserId);
        peer = { pc, stream: null };
      }

      const { pc } = peer;

      switch (type) {
        case 'offer':
          console.log('[WebRTC Signal] Received offer from:', fromUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendAnswer(roomId, userId, fromUserId, answer);
          console.log('[WebRTC Signal] Sent answer to:', fromUserId);
          break;

        case 'answer':
          console.log('[WebRTC Signal] Received answer from:', fromUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          break;

        case 'ice-candidate':
          console.log('[WebRTC Signal] Received ICE candidate from:', fromUserId);
          if (data) {
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
          break;

        case 'participant-joined':
          console.log('[WebRTC Signal] Participant joined:', fromUserId);

          // Initiate connection if we're the "older" user (lexicographic order)
          if (userId < fromUserId && isMediaActiveRef.current) {
            console.log('[WebRTC Signal] ✅ Initiating connection');
            setTimeout(async () => {
              const newPeer = peerConnectionsRef.current.get(fromUserId);
              if (!newPeer) {
                const pc = createPeer(fromUserId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await sendOffer(roomId, userId, fromUserId, offer);
                console.log('[WebRTC Signal] ✅ Sent offer to new participant:', fromUserId);
              }
            }, Math.random() * 500);
          }
          break;

        case 'participant-left':
          console.log('[WebRTC Signal] Participant left:', fromUserId);
          const leavingPeer = peerConnectionsRef.current.get(fromUserId);
          if (leavingPeer) {
            cleanupPeerConnection(leavingPeer);
            peerConnectionsRef.current.delete(fromUserId);
            onPeerDisconnected(fromUserId);
          }
          break;
      }
    } catch (error) {
      console.error('[WebRTC Signal] Error handling signal:', type, error);
    }
  };
}
