# Playground Feature

## Overview

Collaborative learning environment with **voice/video chat** and **writing boards** for German language practice.

## Tech Stack

- **WebRTC** - Raw RTCPeerConnection (no PeerJS)
- **Cloudflare Durable Objects** - WebSocket signaling (WebSocket Hibernation API)
- **Native WebSocket** - Client signaling transport (no Socket.io)
- **STUN** - NAT traversal (Google servers)
- **TURN** - Relay for restrictive networks (configured via env vars)

## File Structure

```
lib/hooks/
├── useWebRTCMedia.ts              # Main hook - orchestrates everything
└── webrtc/
    ├── config.ts                  # ICE servers, TURN env vars
    ├── socketSignaling.ts         # Native WebSocket signaling client
    ├── mediaStreamManager.ts      # getUserMedia (separate audio/video)
    ├── peerManager.ts             # RTCPeerConnection lifecycle
    ├── useMediaControls.ts        # Mute/video toggle
    ├── useMediaSession.ts         # Start/stop media sessions
    └── types.ts                   # TypeScript interfaces

signaling-worker/                  # Cloudflare Worker (deployed separately)
├── src/
│   ├── index.ts                   # Worker entry: routes /room/:roomId to DO
│   ├── signalingRoom.ts           # Durable Object: WebSocket Hibernation
│   └── types.ts                   # JSON message protocol types
├── wrangler.toml                  # Worker config + DO binding
├── tsconfig.json
└── package.json

components/playground/
├── VideoPanel.tsx                 # Controls + layout selector
├── VideoGridView.tsx              # Video grid (combines audio+video streams)
└── VideoLayoutSelector.tsx        # Layout options
```

## Connection Flow

```
Client A                  Durable Object (DO)              Client B
  |                              |                              |
  |  1. WebSocket connect        |                              |
  |  GET /room/:roomId  ────────>|                              |
  |  <── WS upgrade ────────────>|                              |
  |                              |<──── WS connect ─────────────|
  |                              |                              |
  |  2. { type: "join" } ──────>|                              |
  |                              |  3. { type: "join" } <──────|
  |                              |                              |
  |  <── addPeer(B, offer:true)  |                              |
  |                              |── addPeer(A, offer:false) ──>|
  |                              |                              |
  |  4. createOffer()            |                              |
  |  relaySDP(B, offer) ───────>|── sessionDescription ───────>|
  |                              |                              |
  |                              |<── relaySDP(A, answer) ─────|
  |  <── sessionDescription ─────|  5. createAnswer()           |
  |                              |                              |
  |  <════════ ICE candidates via relayICE ════════════════════>|
  |                              |                              |
  |  ═══════════ WebRTC P2P Audio/Video Connected ═════════════>|
```

The **newer joiner** receives `shouldCreateOffer: true` and initiates the WebRTC offer.
The non-offerer's peer connection is created lazily when the offer SDP arrives (avoids glare).

## Signaling Protocol (JSON over WebSocket)

### Client → Server

| Message | Fields | Purpose |
|---------|--------|---------|
| `join` | `peerId`, `userName` | Register in room, triggers addPeer to all |
| `leave` | — | Unregister, triggers removePeer to all |
| `relaySDP` | `peerId`, `sessionDescription` | Relay offer/answer to specific peer |
| `relayICE` | `peerId`, `iceCandidate` | Relay ICE candidate to specific peer |
| `peerStatus` | `peerId`, `status: { isMuted?, isVideoEnabled? }` | Relay mute/video state |

### Server → Client

| Message | Fields | Purpose |
|---------|--------|---------|
| `addPeer` | `peerId`, `userName`, `shouldCreateOffer` | New peer joined — create PC |
| `removePeer` | `peerId` | Peer left — cleanup PC |
| `sessionDescription` | `peerId`, `sessionDescription` | Relayed SDP from peer |
| `iceCandidate` | `peerId`, `iceCandidate` | Relayed ICE candidate from peer |
| `peerStatus` | `peerId`, `status` | Relayed mute/video status |

## ICE Server Configuration

Uses STUN (Google) + TURN (configured via env vars). Config auto-generates both UDP and TCP transport URLs.

```env
# .env.local
NEXT_PUBLIC_TURN_URL=turn:your-turn-server:3478
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
```

Resulting ICE config:
- `stun:stun.l.google.com:19302` (STUN)
- `stun:stun1.l.google.com:19302` (STUN backup)
- `turn:host:3478` (UDP relay)
- `turn:host:3478?transport=tcp` (TCP fallback)

## Key Design Decisions

1. **Separate audio/video streams** - Independent `getUserMedia()` calls for mic and camera, allowing video toggle without affecting audio
2. **Lazy peer creation (non-offerer)** - Only the offerer creates the RTCPeerConnection in `handleAddPeer`; the answerer creates lazily in `handleSessionDescription` to avoid `onnegotiationneeded` glare
3. **Suppressed initial negotiation** - `onnegotiationneeded` only fires after `connectionEstablished = true` (set when `pc.connectionState === 'connected'`), preventing unwanted offers during initial transceiver setup
4. **WebSocket message queue** - Messages sent while the socket is in CONNECTING state are buffered and flushed on open (handles Cloudflare cold starts)
5. **Combined audio+video on `<video>` elements** - Remote video elements receive a combined MediaStream with both audio and video tracks for browser autoplay compatibility
6. **Interaction-based play fallback** - If autoplay is blocked, registers click/touch/keydown listeners to retry `.play()`
7. **Disconnected grace period** - 5-second wait before cleanup (WebRTC state often recovers)
8. **ICE restart on failure** - Up to 3 restart attempts with `iceRestart: true` offer
9. **Audio separation for analysis** - HTML Audio element for playback, Web Audio API (gain=0) for level analysis only
10. **replaceTrack for video toggle** - Uses `sender.replaceTrack()` on existing transceiver instead of renegotiation

## Environment Variables

**Local development:**
```env
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8787
```

**Production (Vercel):**
```env
NEXT_PUBLIC_SIGNALING_URL=wss://testmanship-signaling.zoom-flux.workers.dev
```

## Development

```bash
# Terminal 1: Signaling worker (local)
cd signaling-worker && npx wrangler dev

# Terminal 2: Next.js app
npm run dev
```

Or use the npm script:
```bash
npm run dev:signaling  # Runs wrangler dev in signaling-worker/
```

## Deployment

```bash
# Deploy signaling worker to Cloudflare
cd signaling-worker && npx wrangler deploy

# Set production env var in Vercel dashboard:
# NEXT_PUBLIC_SIGNALING_URL=wss://testmanship-signaling.zoom-flux.workers.dev
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `[SIG] WebSocket error` | Worker not running or wrong URL | Check `NEXT_PUBLIC_SIGNALING_URL`, run `wrangler dev` |
| No `addPeer` after join | Other peer hasn't joined yet, or worker issue | Both peers must click Start Voice/Video |
| ICE failed after 3 restarts | TURN credentials expired or restrictive NAT | Configure TURN env vars |
| No audio after connection | AudioContext suspended | Resumed on user gesture (click/touch) |
| Video always muted | Audio track on separate element | Fixed: audio+video combined on `<video>` element |
| `Cannot set remote answer in state stable` | SDP glare (both sides sent offers) | Fixed: lazy peer creation + negotiation suppression |
| Works locally but not production | Wrong signaling URL | Set `NEXT_PUBLIC_SIGNALING_URL` in Vercel env vars |
| `[SIG] send failed — no ws` | React StrictMode double-mount | Fixed: stale handler check (`ws === socket`) |
