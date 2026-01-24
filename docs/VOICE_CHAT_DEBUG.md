# Voice/Video Chat Debugging

## Log Prefixes

Each module uses a distinct prefix for easy filtering:

| Prefix | Source File | What it logs |
|--------|-------------|--------------|
| `[MIC]` | `mediaStreamManager.ts` | getUserMedia audio requests, track info |
| `[CAM]` | `mediaStreamManager.ts` | getUserMedia video requests, track info |
| `[SIG]` | `socketSignaling.ts` | WebSocket connect/close/error, messages sent/received |
| `[RTC]` | `peerManager.ts` | Track additions, ontrack, connection state, ICE |
| `[MEDIA]` | `useWebRTCMedia.ts` | addPeer, SDP handling, offer/answer creation |
| `[SESSION]` | `useMediaSession.ts` | Join/leave room, stream acquisition |
| `[VIDEO]` | `VideoGridView.tsx` | Stream attachment to video elements |

## Quick Diagnosis

Open browser console and filter by prefix to isolate issues.

### Successful Connection (Full Sequence)

```
[MIC] requesting audio stream...
[MIC] got audio track: Default - Microphone enabled: true readyState: live muted: false
[SESSION] joining room playground-abc as user123 John
[SIG] → join
[SIG] WebSocket connected to wss://testmanship-signaling.zoom-flux.workers.dev/room/playground-abc
[SIG] ← addPeer peer456
[MEDIA] addPeer peer456 Jane offer: true
[RTC] peer456 | added local audio track ... enabled: true
[RTC] peer456 | no local video — added recvonly transceiver
[MEDIA] created offer for peer456 → sending SDP
[SIG] → relaySDP peer456
[SIG] ← sessionDescription peer456
[MEDIA] received SDP answer from peer456
[MEDIA] setRemoteDescription OK for peer456
[RTC] peer456 | connection: connecting
[RTC] peer456 | connection: connected
[RTC] peer456 | ontrack: audio id: ... enabled: true muted: false
```

### Successful Video Connection

```
[MIC] requesting audio stream...
[MIC] got audio track: Default - Microphone enabled: true readyState: live muted: false
[CAM] requesting video stream...
[CAM] got video track: HD Camera enabled: true readyState: live
[SESSION] joining room (video) playground-abc as user123 John
[SIG] → join
[SIG] ← addPeer peer456
[MEDIA] addPeer peer456 Jane offer: true
[RTC] peer456 | added local audio track ... enabled: true
[RTC] peer456 | added local video track ... enabled: true
[MEDIA] created offer for peer456 → sending SDP
...
[RTC] peer456 | ontrack: audio ...
[RTC] peer456 | ontrack: video ...
[VIDEO] Attaching combined stream for peer456 (audio+video)
```

## Failure Scenarios

### 1. WebSocket Never Connects

```
[SIG] WebSocket error
```

**Causes:**
- Wrong `NEXT_PUBLIC_SIGNALING_URL` (check `.env.local` or Vercel env vars)
- Signaling worker not running (`cd signaling-worker && npx wrangler dev`)
- Cloudflare worker crashed (check `wrangler tail` for errors)

### 2. Join Sent But No addPeer Response

```
[SESSION] joining room playground-abc as user123 John
[SIG] → join
(silence — no [SIG] ← addPeer)
```

**Causes:**
- The other peer hasn't clicked "Start Voice/Video" yet (both must join)
- WebSocket closed before join was processed (check for `[SIG] WebSocket closed` after the join)
- Durable Object error (check `wrangler tail` or Cloudflare dashboard logs)

### 3. Microphone Not Acquired

```
[MIC] requesting audio stream...
[MIC] advanced constraints failed, retrying basic... DOMException: NotAllowedError
[MIC] retry 1 failed, final attempt... DOMException: NotAllowedError
```

**Causes:**
- Browser blocked mic access (user denied permission)
- No microphone connected
- Another app holding exclusive mic access

### 4. Camera Not Acquired

```
[CAM] requesting video stream...
[CAM] HD constraints failed, retrying lower... OverconstrainedError
```

**Causes:**
- Camera in use by another app
- Browser privacy settings blocking camera
- No camera hardware available

### 5. ICE Failure

```
[RTC] peer456 | connection: connecting
[WebRTC] ICE restart 1/3 for: peer456
[WebRTC] ICE restart 2/3 for: peer456
[WebRTC] ICE restart 3/3 for: peer456
[RTC] peer456 | connection: failed
```

**Causes:**
- No TURN server configured (only works on same network without TURN)
- TURN credentials expired
- Symmetric NAT on both sides without relay

**Fix:** Configure TURN env vars:
```env
NEXT_PUBLIC_TURN_URL=turn:your-turn-server:3478
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
```

### 6. SDP Glare (Should Be Fixed)

```
[MEDIA] SDP handling failed for peer456 InvalidStateError: Cannot set remote answer in state stable
```

**This was fixed by:**
- Only offerer creates peer in `handleAddPeer`
- Non-offerer creates peer lazily in `handleSessionDescription`
- `onnegotiationneeded` suppressed until connection established

If you still see this, the fix may have regressed — check `peerManager.ts` line 117-130.

### 7. Audio Not Playing (Autoplay Blocked)

Connection succeeds, tracks received, but no sound:

```
[RTC] peer456 | ontrack: audio id: ... enabled: true muted: false
```

But no audio heard.

**Causes:**
- Browser autoplay policy blocked `.play()` on the audio element
- AudioContext still suspended

**Fix:** Click anywhere on the page (triggers interaction-based fallback in `peerManager.ts:160-172`).

### 8. WebSocket Stale Handler

```
[SIG] send failed — no ws or closed, state: undefined
```

**This was fixed by:** Capturing WebSocket as local variable in `connectWebSocket()`, checking `ws === socket` in `onclose` before clearing. React StrictMode double-mount caused the old socket's handler to clobber the new one.

## Browser DevTools

- **Chrome:** `chrome://webrtc-internals` - All RTCPeerConnections, ICE candidates, stats
- **Firefox:** `about:webrtc` - Similar debugging info
- **Network tab → WS:** Filter WebSocket frames to see JSON messages flowing

## Debugging Checklist

1. **Is the signaling worker running?**
   - Look for `[SIG] WebSocket connected to ...`
   - If not: check URL, run `wrangler dev`

2. **Did getUserMedia succeed?**
   - Look for `[MIC] got audio track:` with `readyState: live`
   - If not: check permissions, hardware

3. **Did join message send?**
   - Look for `[SIG] → join`
   - If not: socket connection issue

4. **Did addPeer arrive?**
   - Look for `[SIG] ← addPeer`
   - If not: other peer hasn't joined, or DO issue

5. **Was offer/answer exchanged?**
   - Look for `[MEDIA] created offer` and `[MEDIA] setRemoteDescription OK`
   - If not: SDP relay issue

6. **Did ICE succeed?**
   - Look for `[RTC] ... connection: connected`
   - If not: TURN needed, firewall issue

7. **Were tracks received?**
   - Look for `[RTC] ... ontrack: audio` / `ontrack: video`
   - If not: tracks not added to peer connection

8. **Is audio playing?**
   - Check hidden `<audio>` elements in DOM (1x1px, opacity 0)
   - Check `audio.paused` — if true, autoplay was blocked

## Common Fixes

| Issue | Check |
|-------|-------|
| "Permission denied" | Browser blocked mic/camera access |
| No audio output | AudioContext suspended — click page to trigger play |
| Connected but no stream | ICE failing — configure TURN |
| Works on WiFi, not mobile | TURN needed for carrier NAT |
| Connection drops on tab switch | ICE restart handles this (up to 3 attempts) |
| Video not sending after toggle | Check transceiver direction via `chrome://webrtc-internals` |
| `[SIG] queuing (connecting)` | Normal — messages buffered during cold start, flushed on open |
