/**
 * SignalingRoom Durable Object
 * Manages WebRTC signaling for a single room using WebSocket Hibernation API
 */

import type { ClientMessage, ServerMessage, PeerAttachment } from './types';

export class SignalingRoom implements DurableObject {
  private ctx: DurableObjectState;

  constructor(ctx: DurableObjectState, _env: unknown) {
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, rawMessage: string | ArrayBuffer): Promise<void> {
    if (typeof rawMessage !== 'string') return;

    let msg: ClientMessage;
    try {
      msg = JSON.parse(rawMessage);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join':
        this.handleJoin(ws, msg.peerId, msg.userName);
        break;
      case 'relaySDP':
        this.handleRelaySDP(ws, msg.peerId, msg.sessionDescription);
        break;
      case 'relayICE':
        this.handleRelayICE(ws, msg.peerId, msg.iceCandidate);
        break;
      case 'peerStatus':
        this.handlePeerStatus(ws, msg.peerId, msg.status);
        break;
      case 'leave':
        this.handleLeave(ws);
        break;
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.handleLeave(ws);
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    this.handleLeave(ws);
  }

  private handleJoin(ws: WebSocket, peerId: string, userName: string): void {
    // Store peer info on the WebSocket
    ws.serializeAttachment({ peerId, userName } satisfies PeerAttachment);

    // Get all existing peers
    const allSockets = this.ctx.getWebSockets();
    for (const other of allSockets) {
      if (other === ws) continue;
      const attachment = other.deserializeAttachment() as PeerAttachment | null;
      if (!attachment) continue;

      // Tell the new joiner about existing peer (new joiner creates offer)
      this.send(ws, {
        type: 'addPeer',
        peerId: attachment.peerId,
        userName: attachment.userName,
        shouldCreateOffer: true,
      });

      // Tell existing peer about new joiner (existing peer waits for offer)
      this.send(other, {
        type: 'addPeer',
        peerId,
        userName,
        shouldCreateOffer: false,
      });
    }
  }

  private handleRelaySDP(ws: WebSocket, targetPeerId: string, sessionDescription: Record<string, unknown>): void {
    const sender = ws.deserializeAttachment() as PeerAttachment | null;
    if (!sender) return;

    const target = this.findPeerSocket(targetPeerId);
    if (!target) return;

    this.send(target, {
      type: 'sessionDescription',
      peerId: sender.peerId,
      sessionDescription,
    });
  }

  private handleRelayICE(ws: WebSocket, targetPeerId: string, iceCandidate: Record<string, unknown>): void {
    const sender = ws.deserializeAttachment() as PeerAttachment | null;
    if (!sender) return;

    const target = this.findPeerSocket(targetPeerId);
    if (!target) return;

    this.send(target, {
      type: 'iceCandidate',
      peerId: sender.peerId,
      iceCandidate,
    });
  }

  private handlePeerStatus(ws: WebSocket, targetPeerId: string, status: { isMuted?: boolean; isVideoEnabled?: boolean }): void {
    const sender = ws.deserializeAttachment() as PeerAttachment | null;
    if (!sender) return;

    const target = this.findPeerSocket(targetPeerId);
    if (!target) return;

    this.send(target, {
      type: 'peerStatus',
      peerId: sender.peerId,
      status,
    });
  }

  private handleLeave(ws: WebSocket): void {
    const attachment = ws.deserializeAttachment() as PeerAttachment | null;
    if (!attachment) return;

    // Clear attachment so we don't process this peer again
    ws.serializeAttachment(null);

    // Notify remaining peers
    const allSockets = this.ctx.getWebSockets();
    for (const other of allSockets) {
      if (other === ws) continue;
      const otherAttachment = other.deserializeAttachment() as PeerAttachment | null;
      if (!otherAttachment) continue;

      this.send(other, {
        type: 'removePeer',
        peerId: attachment.peerId,
      });
    }

    try { ws.close(1000, 'leaving'); } catch { /* already closed */ }
  }

  private findPeerSocket(peerId: string): WebSocket | null {
    const allSockets = this.ctx.getWebSockets();
    for (const ws of allSockets) {
      const attachment = ws.deserializeAttachment() as PeerAttachment | null;
      if (attachment?.peerId === peerId) return ws;
    }
    return null;
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch { /* socket may have closed */ }
  }
}
