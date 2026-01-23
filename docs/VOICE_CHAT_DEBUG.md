# Voice/Video Chat Debugging

## Quick Diagnosis

Open browser console and check the log sequence:

### Successful Connection
```
[Media Session] Starting media...
[WebRTC Peer] Creating peer connection for: user@email.com
[WebRTC Signal] Processing: offer from: user@email.com
[WebRTC Signal] Sent answer to: user@email.com
[WebRTC Peer] 🧊 ICE state: checking → connected
[WebRTC Peer] Connection state: connecting → connected
[WebRTC Peer] 🎵 Received track from: user@email.com
```

### ICE Failure with Auto-Restart
```
[WebRTC Peer] 🧊 ICE state: checking → failed
[WebRTC Peer] 🔄 ICE restart attempt 1/3 for: user@email.com
[WebRTC Peer] 🧊 ICE state: checking → connected  ← success after restart
```

If all 3 restarts fail:
```
[WebRTC Peer] 🔄 ICE restart attempt 3/3 for: user@email.com
[WebRTC Peer] 🧊 ICE state: checking → failed
```
**Fix:** TURN credentials may be expired. Refresh from ExpressTURN dashboard. Current config uses `free.expressturn.com:3478` with both UDP and TCP transports.

### No Track Received
If connection succeeds but no `🎵 Received track` log:
- Check that `localStreamRef.current` has tracks before peer creation
- Verify `getUserMedia` succeeded (check for permission errors)

### Signal Not Arriving
If no `Processing: offer` log on receiver side:
- Check Firebase RTDB rules allow read/write to `playground_voice/`
- Verify both users are in the same roomId
- Check 10-second age filter isn't dropping valid signals

## Browser Tools

- **Chrome:** `chrome://webrtc-internals` - Shows all RTCPeerConnections, ICE candidates, stats
- **Firefox:** `about:webrtc` - Similar debugging info

## Common Fixes

| Issue | Check |
|-------|-------|
| "Permission denied" | Browser blocked mic/camera access |
| No audio output | AudioContext might be suspended - needs user gesture |
| Can see placeholder but no stream | ICE failing - check TURN credentials |
| Works on same WiFi, not across networks | TURN credentials expired or missing |
| Connection drops after tab switch | Browser throttling - ICE restart handles this (up to 3 attempts) |
| Video not sending after toggle | Check transceiver direction changed to `sendrecv` in chrome://webrtc-internals |
