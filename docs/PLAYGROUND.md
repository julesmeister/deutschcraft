# Playground Feature

## Overview

Collaborative learning environment with **voice/video chat** and **writing boards** for German language practice.

## Tech Stack

- **WebRTC** - Raw RTCPeerConnection (no PeerJS)
- **Firebase Realtime Database** - Signaling (offer/answer/ICE candidates)
- **Firebase RTDB** - Participant presence
- **STUN** - NAT traversal (Google servers)
- **TURN** - Relay for restrictive networks (configured via env vars)

## File Structure

```
lib/hooks/
├── useWebRTCMedia.ts              # Main hook - orchestrates everything
└── webrtc/
    ├── config.ts                  # ICE servers, TURN env vars
    ├── firebaseSignaling.ts       # Firebase RTDB signaling
    ├── mediaStreamManager.ts      # getUserMedia, track management
    ├── peerManager.ts             # RTCPeerConnection lifecycle
    ├── signalHandler.ts           # Signal processing (serialized queue)
    ├── useMediaControls.ts        # Mute/video toggle
    ├── useMediaSession.ts         # Start/stop media sessions
    └── types.ts                   # TypeScript interfaces

components/playground/
├── VideoPanel.tsx                 # Controls + layout selector
├── VideoGridView.tsx              # Video grid with mirrors
└── VideoLayoutSelector.tsx        # Layout options
```

## Connection Flow

```
User A (initiator: userId < B)          Firebase RTDB          User B
  |                                          |                     |
  |  1. listenForSignals()                   |                     |
  |  2. listenForParticipants()              |                     |
  |  3. registerParticipant() ───────────────|──────────────────>  |
  |                                          |  4. sees A joined   |
  |                                          |<── sends offer ─────|
  |  5. receives offer                       |                     |
  |     setRemoteDescription()               |                     |
  |     createAnswer()                       |                     |
  |     sendAnswer() ────────────────────────|──────────────────>  |
  |                                          |  6. receives answer  |
  |  <─────── ICE candidates exchange ───────────────────────────> |
  |                                          |                     |
  |  ═══════ WebRTC P2P Audio/Video Connected ═══════════════════  |
```

## ICE Server Configuration

Uses ExpressTURN (free tier) for relay. Config auto-generates both UDP and TCP transport URLs from a single env var.

```env
# .env.local
NEXT_PUBLIC_TURN_URL=turn:free.expressturn.com:3478
NEXT_PUBLIC_TURN_USERNAME=efPU52K4SLOQ34W2QY
NEXT_PUBLIC_TURN_CREDENTIAL=1TJPNFxHKXrZfelz
```

Resulting ICE config:
- `stun:stun.l.google.com:19302` (STUN)
- `turn:free.expressturn.com:3478` (UDP relay)
- `turn:free.expressturn.com:3478?transport=tcp` (TCP fallback)

Without TURN, only same-network or non-restrictive NAT connections work (STUN-only).

## Key Design Decisions

1. **addTransceiver over addTrack** - Creates audio/video transceivers with explicit direction (`sendrecv`/`recvonly`) from the start, ensuring proper SDP negotiation even before tracks arrive
2. **Signal queue serialization** - Prevents ICE candidates from being processed before remote description is set
3. **Listener-first registration** - Signal/participant listeners set up before `registerParticipant()` to avoid missing incoming offers
4. **Duplicate peer prevention** - Checks `peerConnectionsRef` before creating new peers
5. **onnegotiationneeded handler** - Supports renegotiation when tracks are added after initial connection
6. **Disconnected grace period** - 5-second wait before cleanup (state often recovers)
7. **ICE restart on failure** - Up to 3 restart attempts with `iceRestart: true` offer before giving up
8. **Audio separation** - HTML Audio element for playback, Web Audio API (gain=0) for analysis only
9. **replaceTrack for video toggle** - Uses `sender.replaceTrack()` on existing transceiver instead of adding new tracks

## Database Schema (Firebase RTDB)

```
playground_voice/{roomId}/
├── participants/{sanitizedUserId}
│   ├── userId: string
│   ├── userName: string
│   ├── isMuted: boolean
│   └── timestamp: number
└── signals/{pushId}
    ├── type: 'offer' | 'answer' | 'ice-candidate' | 'participant-joined' | 'participant-left'
    ├── fromUserId: string
    ├── toUserId: string (optional, broadcast if empty)
    ├── data: RTCSessionDescriptionInit | RTCIceCandidateInit
    └── timestamp: number
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| ICE failed after 3 restarts | TURN credentials expired or restrictive NAT | Refresh ExpressTURN credentials |
| No audio after connection | AudioContext suspended | Resumed on user gesture |
| Double audio / echo | Web Audio API + HTML Audio both playing | Gain=0 on Web Audio path |
| Stale signals processed | Old signals in RTDB | 10-second age filter |
| Duplicate peer connections | Both signal handler and participant listener create | Pre-check peerConnectionsRef |
| Video toggle doesn't transmit | Transceiver direction still `recvonly` | `replaceTrack` + set `sendrecv` |
