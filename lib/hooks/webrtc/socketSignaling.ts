/**
 * WebSocket Signaling Client
 * Connects to the Cloudflare Durable Object signaling worker for WebRTC peer coordination
 */

export interface PeerStatusUpdate {
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

export interface SignalingCallbacks {
  onAddPeer: (peerId: string, userName: string, shouldCreateOffer: boolean) => void;
  onRemovePeer: (peerId: string) => void;
  onSessionDescription: (peerId: string, sdp: RTCSessionDescriptionInit) => void;
  onIceCandidate: (peerId: string, candidate: RTCIceCandidateInit) => void;
  onPeerStatus: (peerId: string, status: PeerStatusUpdate) => void;
}

export interface SignalingSocket {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8787';

let ws: WebSocket | null = null;
let callbacks: SignalingCallbacks | null = null;
let currentRoomId: string | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let intentionalClose = false;

function getReconnectDelay(): number {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 10000);
  reconnectAttempt++;
  return delay;
}

function connectWebSocket(roomId: string): void {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const baseUrl = SIGNALING_URL.replace(/\/$/, '');
  const url = `${baseUrl}/room/${roomId}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnectAttempt = 0;
  };

  ws.onmessage = (event) => {
    if (!callbacks) return;

    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'addPeer':
        callbacks.onAddPeer(msg.peerId, msg.userName, msg.shouldCreateOffer);
        break;
      case 'removePeer':
        callbacks.onRemovePeer(msg.peerId);
        break;
      case 'sessionDescription':
        callbacks.onSessionDescription(msg.peerId, msg.sessionDescription);
        break;
      case 'iceCandidate':
        callbacks.onIceCandidate(msg.peerId, msg.iceCandidate);
        break;
      case 'peerStatus':
        callbacks.onPeerStatus(msg.peerId, msg.status);
        break;
    }
  };

  ws.onclose = () => {
    ws = null;
    if (!intentionalClose && currentRoomId) {
      reconnectTimer = setTimeout(() => connectWebSocket(currentRoomId!), getReconnectDelay());
    }
  };

  ws.onerror = () => {
    // onclose will fire after onerror
  };
}

function send(msg: object): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function createSignalingSocket(roomId: string): SignalingSocket {
  currentRoomId = roomId;
  intentionalClose = false;

  return {
    get connected() {
      return ws !== null && ws.readyState === WebSocket.OPEN;
    },
    connect() {
      intentionalClose = false;
      connectWebSocket(roomId);
    },
    disconnect() {
      intentionalClose = true;
      currentRoomId = null;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws) {
        ws.close(1000, 'disconnect');
        ws = null;
      }
    },
  };
}

export function joinRoom(socket: SignalingSocket, roomId: string, peerId: string, userName: string): void {
  send({ type: 'join', peerId, userName });
}

export function leaveRoom(socket: SignalingSocket): void {
  send({ type: 'leave' });
}

export function relaySDP(socket: SignalingSocket, peerId: string, sessionDescription: RTCSessionDescriptionInit): void {
  send({ type: 'relaySDP', peerId, sessionDescription });
}

export function relayICE(socket: SignalingSocket, peerId: string, iceCandidate: RTCIceCandidateInit): void {
  send({ type: 'relayICE', peerId, iceCandidate });
}

export function sendPeerStatus(socket: SignalingSocket, peerId: string, status: PeerStatusUpdate): void {
  send({ type: 'peerStatus', peerId, status });
}

export function registerCallbacks(socket: SignalingSocket, cbs: SignalingCallbacks): void {
  callbacks = cbs;
}

export function unregisterCallbacks(socket: SignalingSocket): void {
  callbacks = null;
}
