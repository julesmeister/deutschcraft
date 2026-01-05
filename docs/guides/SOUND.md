# Audio Spaces Implementation Comparison

This document compares the working implementation from `alter.gay` with our current implementation to identify what's missing.

## Overview

**alter.gay**: ✅ Working WebRTC audio with Supabase Realtime
**testmanship-web-v2**: ❌ No audio - WebRTC connections not establishing

## Core Differences

### Signaling Backend

| Feature | alter.gay | testmanship-web-v2 | Status |
|---------|-----------|-------------------|--------|
| Signaling Service | **Supabase Realtime** (broadcast channels) | **Firebase RTDB** (onChildAdded) | ⚠️ Different |
| Signal Delivery | Instant broadcast to all clients | Push to RTDB, listen with onChildAdded | ⚠️ May be delayed |
| Acknowledgment | Built-in ack support | No ack | ❌ Missing |
| Self-filtering | `self: false` in config | Manual filtering by userId | ⚠️ More complex |

### WebRTC Implementation

#### ICE Servers Configuration

**alter.gay** (10 servers):
```typescript
const ICE_SERVERS = [
  // Google STUN (5 servers)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },

  // OpenRelay TURN (3 configs)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },

  // Backup STUN (2 servers)
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
];
```

**testmanship-web-v2** (10 servers):
```typescript
const ICE_SERVERS = [
  // Same as alter.gay
];
```

✅ **Status**: Same ICE servers

#### Audio Constraints

**alter.gay**:
```typescript
const audioConstraints: MediaTrackConstraints & Record<string, any> = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  sampleSize: 16,
  channelCount: 1,
  latency: 0,
  // Browser specific optimizations
  googEchoCancellation: true,
  googAutoGainControl: true,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googTypingNoiseDetection: true,
};
```

**testmanship-web-v2**:
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },
  video: false,
});
```

⚠️ **Missing**:
- `sampleSize: 16`
- `channelCount: 1`
- `latency: 0`
- Google-specific optimizations (goog*)

#### Audio Processing Pipeline

**alter.gay**:
```typescript
// Local audio processing
const audioContext = new AudioContext({
  latencyHint: 'interactive',
  sampleRate: 48000,
});

const source = audioContext.createMediaStreamSource(stream);
const analyser = audioContext.createAnalyser();
const compressor = audioContext.createDynamicsCompressor();

// Configure compressor
compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
compressor.knee.setValueAtTime(40, audioContext.currentTime);
compressor.ratio.setValueAtTime(12, audioContext.currentTime);
compressor.attack.setValueAtTime(0, audioContext.currentTime);
compressor.release.setValueAtTime(0.25, audioContext.currentTime);

// Connect audio graph (but DON'T connect to destination for local mic!)
source.connect(compressor);
compressor.connect(analyser);
// NOTE: No connection to destination - prevents echo
```

**testmanship-web-v2**:
```typescript
// Only for remote audio
if (!audioContextRef.current) {
  audioContextRef.current = new AudioContext();
}

// No local audio processing
// No compressor for local mic
```

❌ **Missing**: Local audio processing (but this is OK - we don't want to hear ourselves)

#### Remote Audio Playback

**alter.gay**:
```typescript
pc.ontrack = (event) => {
  const [remoteStream] = event.streams;

  // Method 1: Audio element
  const audioElement = new Audio();
  audioElement.srcObject = remoteStream;
  audioElement.autoplay = true;

  // Optimize playback
  if (audioElement.setSinkId) {
    audioElement.setSinkId('default').catch(console.error);
  }

  audioElement.volume = isDeafened ? 0 : 1;

  // Method 2: Web Audio API processing
  const audioContext = initializeAudioContext();
  const source = audioContext.createMediaStreamSource(remoteStream);
  const analyser = audioContext.createAnalyser();
  const gainNode = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();

  // Configure processing
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;

  compressor.threshold.setValueAtTime(-40, audioContext.currentTime);
  compressor.knee.setValueAtTime(30, audioContext.currentTime);
  compressor.ratio.setValueAtTime(8, audioContext.currentTime);
  compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
  compressor.release.setValueAtTime(0.25, audioContext.currentTime);

  // Connect to speakers!
  source.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);  // ← KEY!

  // Store references
  peer.audioElement = audioElement;
  peer.analyser = analyser;
  peer.gainNode = gainNode;
  peer.compressor = compressor;
};
```

**testmanship-web-v2**:
```typescript
pc.ontrack = (event) => {
  const [remoteStream] = event.streams;

  // Method 1: HTML Audio Element
  const audio = new Audio();
  audio.srcObject = remoteStream;
  audio.autoplay = true;
  audio.volume = 1.0;
  audio.play().then(() => {
    console.log('[WebRTC] ✅ Audio element playing');
  });

  // Method 2: Web Audio API
  if (audioContextRef.current) {
    const source = audioContextRef.current.createMediaStreamSource(remoteStream);
    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.value = 1.0;

    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);  // ← We have this!
  }
};
```

✅ **Status**: We have both methods, should work!

⚠️ **Missing**:
- Compressor for remote audio
- Analyser for audio level monitoring
- Storing audio element reference

### Signaling Flow

#### alter.gay Flow

1. **User joins space**:
```typescript
channel.send({
  type: 'broadcast',
  event: 'participant-joined',
  payload: { userId, timestamp }
});
```

2. **Listeners receive immediately**:
```typescript
channel.on('broadcast', { event: 'participant-joined' }, ({ payload }) => {
  if (payload.userId !== user.id) {
    createOffer(payload.userId);
  }
});
```

3. **Offer sent**:
```typescript
channel.send({
  type: 'broadcast',
  event: 'signal',
  payload: {
    type: 'offer',
    fromUserId: user.id,
    toUserId: targetUserId,
    data: offer
  }
});
```

4. **Other user receives offer**:
```typescript
channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
  if (payload.toUserId === user.id) {
    handleSignal(payload);
  }
});
```

5. **Connection established** ✅

#### testmanship-web-v2 Flow

1. **User starts voice**:
```typescript
await broadcastSignal(roomId, {
  type: 'participant-joined',
  fromUserId: userId,
  timestamp: Date.now(),
});
```

2. **Listeners should receive**:
```typescript
onChildAdded(signalsQuery, (snapshot) => {
  const signal = snapshot.val();
  // Process signal
});
```

3. **Offer sent** (if userId comparison passes):
```typescript
await sendOffer(roomId, userId, remoteUserId, offer);
```

4. **Problem**: ❌ Other user may not receive in time, or signals filtered as "old"

### Connection Initiation Logic

**alter.gay**:
```typescript
// Simple: Just create offer when someone joins
channel.on('broadcast', { event: 'participant-joined' }, ({ payload }) => {
  if (payload.userId !== user.id) {
    const delay = Math.random() * 1000; // Avoid collision
    setTimeout(() => createOffer(payload.userId), delay);
  }
});
```

**testmanship-web-v2**:
```typescript
// Complex: Only initiate if userId is "smaller"
if (userId < remoteUserId && isVoiceActiveRef.current) {
  setTimeout(async () => {
    const pc = createPeerConnection(remoteUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendOffer(roomId, userId, remoteUserId, offer);
  }, Math.random() * 1000);
}
```

⚠️ **Potential Issue**: If both users have userId > comparison, NEITHER initiates!

### Data Channels

**alter.gay**: ✅ Uses data channels for ping/pong
**testmanship-web-v2**: ❌ No data channels

### Retry Logic

**alter.gay**:
```typescript
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;

if (peer.retryCount < MAX_RETRIES) {
  setTimeout(() => {
    peer.retryCount++;
    createOffer(userId);
  }, RETRY_DELAY * Math.pow(2, peer.retryCount));
}
```

**testmanship-web-v2**: ❌ No retry logic

## Critical Issues Found

### 1. Signal Timing Issue ❌

**Problem**: Signals filtered as "old" (>10 seconds)
**Cause**: Firebase RTDB may have delays, or onChildAdded processes all existing children first
**Solution**: Increase age threshold OR use server timestamps

### 2. Connection Initiation Deadlock ❌

**Problem**: Both users waiting for each other to send offer
**Cause**: userId comparison logic may not work as expected
**Solution**:
- Log actual userId comparison results
- OR: Both users send offers (Supabase-style)
- OR: Use offer/answer collision handling

### 3. No Retry Logic ❌

**Problem**: If first connection attempt fails, no retry
**Solution**: Implement retry with exponential backoff

### 4. Missing Audio Context Settings ⚠️

**alter.gay**: Creates AudioContext with specific settings
```typescript
new AudioContext({
  latencyHint: 'interactive',
  sampleRate: 48000,
});
```

**testmanship-web-v2**:
```typescript
new AudioContext(); // Uses defaults
```

**Impact**: May affect audio quality but shouldn't prevent audio entirely

## Testing Checklist

To debug why there's no audio:

### Phase 1: Verify Signaling ✅/❌
- [ ] Signals are being broadcast to Firebase
- [ ] onChildAdded is firing for new signals
- [ ] Signals are NOT filtered as "old"
- [ ] participant-joined signal is received by other user
- [ ] Offer signal is received
- [ ] Answer signal is received
- [ ] ICE candidate signals are received

### Phase 2: Verify WebRTC Connection ✅/❌
- [ ] RTCPeerConnection created
- [ ] Local stream added to peer connection
- [ ] Offer created and sent
- [ ] Remote description set (offer)
- [ ] Answer created and sent
- [ ] Remote description set (answer)
- [ ] ICE candidates sent
- [ ] ICE candidates received and added
- [ ] ICE gathering state reaches "complete"
- [ ] ICE connection state reaches "connected"
- [ ] Connection state reaches "connected"

### Phase 3: Verify Audio ✅/❌
- [ ] ontrack event fires
- [ ] Remote stream received
- [ ] Remote stream has audio tracks
- [ ] Audio element created
- [ ] Audio element srcObject set
- [ ] Audio element play() succeeds
- [ ] Web Audio API source created
- [ ] Web Audio API connected to destination
- [ ] Browser audio is not muted
- [ ] System volume is up

## Recommended Fixes

### Fix 1: Switch to Supabase Realtime (Most Reliable)

**Pros**:
- Proven to work (alter.gay)
- Instant broadcast
- Built-in acknowledgments
- Self-filtering

**Cons**:
- Adds dependency on Supabase
- Need to set up Supabase project

### Fix 2: Fix Firebase RTDB Signaling

**Changes needed**:
1. Remove age filtering (or increase to 60s)
2. Add retry logic
3. Fix connection initiation (both users send offers)
4. Add data channels for ping/pong
5. Add connection state monitoring

### Fix 3: Use PeerJS (Simplest)

**Pros**:
- Handles signaling automatically
- Built-in retry logic
- Much simpler code

**Cons**:
- We tried this before and had issues
- Less control over signaling

## Current Test Results

**Expected logs when working**:
```
[Signaling] ✅ NEW SIGNAL: participant-joined from: user2
[WebRTC] Processing signal: participant-joined
[WebRTC] ✅ I should initiate connection
[WebRTC] Creating peer connection for: user2
[WebRTC] 🔍 ICE gathering state: gathering
[WebRTC] Sending ICE candidate to: user2
[WebRTC] ✅ Sent offer to new participant: user2
[Signaling] ✅ NEW SIGNAL: answer from: user2
[WebRTC] Received answer from: user2
[WebRTC] 🧊 ICE state: connected
[WebRTC] ▶️ Connection state: connected
[WebRTC] ✅ CONNECTED to: user2
[WebRTC] 🎵 Received track from: user2
[WebRTC] Setting up audio playback for: user2
[WebRTC] ✅ Audio element playing from: user2
[WebRTC] ✅ Web Audio API connected to destination for: user2
```

**Actual logs**: (Need to test with latest changes)
```
[WebRTC] Participants updated: 1
[WebRTC] 👥 Found 1 other participant(s)
[WebRTC] Checking for participants to connect to...
[WebRTC] No existing connection to: Orbit Chill
[WebRTC] Initiating connection check...
[WebRTC] ⏸️ Waiting for offer from: Orbit Chill
```

**Status**: Connection never initiated because userId comparison fails or other user not sending offer.

## Next Steps

1. **Test with latest logging** to see ICE states
2. **Check Firebase RTDB rules** - ensure writes allowed
3. **Try removing age filter** - accept all signals
4. **Log userId comparison** - verify who should initiate
5. **Consider switching to Supabase** - proven solution

## Conclusion

The main issue appears to be **signaling reliability**. Firebase RTDB with onChildAdded may not be as reliable as Supabase Realtime's broadcast channels for WebRTC signaling.

**Recommendation**: Either fix the Firebase signaling thoroughly (add retries, remove age filtering, fix initiation logic) OR switch to Supabase Realtime which is proven to work.
