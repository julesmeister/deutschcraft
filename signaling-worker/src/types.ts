/**
 * WebSocket signaling message protocol types
 * Note: SDP/ICE objects are opaque JSON relayed to clients without inspection.
 */

export interface PeerStatusUpdate {
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

// Opaque WebRTC types (server relays without inspection)
type SessionDescription = Record<string, unknown>;
type IceCandidate = Record<string, unknown>;

// Client → Server messages
export type ClientMessage =
  | { type: 'join'; peerId: string; userName: string }
  | { type: 'relaySDP'; peerId: string; sessionDescription: SessionDescription }
  | { type: 'relayICE'; peerId: string; iceCandidate: IceCandidate }
  | { type: 'peerStatus'; peerId: string; status: PeerStatusUpdate }
  | { type: 'leave' };

// Server → Client messages
export type ServerMessage =
  | { type: 'addPeer'; peerId: string; userName: string; shouldCreateOffer: boolean }
  | { type: 'removePeer'; peerId: string }
  | { type: 'sessionDescription'; peerId: string; sessionDescription: SessionDescription }
  | { type: 'iceCandidate'; peerId: string; iceCandidate: IceCandidate }
  | { type: 'peerStatus'; peerId: string; status: PeerStatusUpdate };

// Attachment stored on each WebSocket via serializeAttachment
export interface PeerAttachment {
  peerId: string;
  userName: string;
}
