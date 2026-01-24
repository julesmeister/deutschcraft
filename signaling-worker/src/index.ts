/**
 * Cloudflare Worker entry point
 * Routes WebSocket upgrades to SignalingRoom Durable Objects by roomId
 */

import { SignalingRoom } from './signalingRoom';

export { SignalingRoom };

export interface Env {
  SIGNALING_ROOM: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // WebSocket upgrade: /room/:roomId
    const roomMatch = url.pathname.match(/^\/room\/([^/]+)$/);
    if (roomMatch) {
      const roomId = roomMatch[1];

      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const id = env.SIGNALING_ROOM.idFromName(roomId);
      const stub = env.SIGNALING_ROOM.get(id);
      return stub.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
