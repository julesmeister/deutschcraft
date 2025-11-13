# Voice Chat Debugging Guide

## Problem Summary

Users reported that voice chat audio was not working despite successful connections. Two users on different devices (PC and tablet) could not hear each other.

## Root Causes Identified

### 1. **CRITICAL: Missing Firestore Voice Status Updates**

**Problem:** When users clicked "Start Voice" or "Stop Voice", the local React state was updated, but the Firestore `isVoiceActive` field was never updated.

**Impact:**
- Other participants couldn't see who was voice-active
- Peer connections were never initiated because participants appeared inactive
- The system thought no one was using voice even when microphones were active

**Fix:**
```typescript
// Created wrapper functions in app/dashboard/playground/page.tsx
const handleStartVoice = async () => {
  if (!myParticipantId) return;

  await startVoice(); // Get microphone
  await updateParticipantVoiceStatus(myParticipantId, true, false); // Update Firestore

  // Update peer ID in Firestore
  if (myPeerId) {
    const participantRef = doc(db, 'playground_participants', myParticipantId);
    await updateDoc(participantRef, { peerId: myPeerId });
  }
};
```

### 2. **Audio Element Not Playing Remote Streams**

**Problem:** The `<audio>` element was receiving the MediaStream but not playing it audibly.

**Causes:**
- Missing `playsInline` attribute (critical for mobile)
- No explicit volume setting
- Browser autoplay restrictions
- Missing error handling

**Fix:**
```typescript
// In components/playground/VoicePanel.tsx
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !participant.stream) return;

  // Set srcObject (modern approach)
  audio.srcObject = participant.stream;

  // Configure audio element
  audio.volume = 1.0;      // Maximum volume
  audio.muted = false;     // Ensure not muted

  // Try to play with error handling
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => console.log('[Voice] Audio playing'))
      .catch((err) => {
        // Retry once
        audio.muted = false;
        audio.play().catch(e => console.error('[Voice] Retry failed:', e));
      });
  }

  return () => {
    // Cleanup
    if (audio.srcObject) {
      audio.pause();
      audio.srcObject = null;
    }
  };
}, [participant.stream]);

// Audio element with all necessary attributes
<audio ref={audioRef} autoPlay playsInline controls={false} />
```

### 3. **Insufficient Logging**

**Problem:** No way to diagnose where the voice pipeline was failing.

**Fix:** Added comprehensive logging:
- Microphone access requests
- Peer connection attempts
- Stream reception events
- Audio playback attempts
- Error messages

## How Voice Chat Works (Full Flow)

### 1. **User Joins Room**
```
User → joinPlaygroundRoom() → Creates participant record in Firestore
                              └→ participantId returned and stored
```

### 2. **User Starts Voice**
```
User clicks "Start Voice"
  ↓
handleStartVoice() called
  ↓
startVoice() - Get microphone access via getUserMedia()
  ↓
myStreamRef.current = stream (local state)
  ↓
updateParticipantVoiceStatus(participantId, true, false)
  ↓
Firestore: isVoiceActive = true ← OTHER PARTICIPANTS SEE THIS
  ↓
Update peerId in Firestore
```

### 3. **Peer Connection Established**
```
useEffect monitors participants[] changes
  ↓
Sees participant.isVoiceActive = true
  ↓
connectToPeer(participant.peerId, userId, userName)
  ↓
peerRef.current.call(peerId, myStreamRef.current) ← SEND LOCAL STREAM
  ↓
Remote peer receives call
  ↓
call.answer(myStreamRef.current) ← SEND BACK THEIR STREAM
  ↓
Both peers emit 'stream' event
  ↓
addParticipant(peerId, remoteStream, call) ← STORE REMOTE STREAM
```

### 4. **Audio Playback**
```
VoicePanel renders VoiceParticipantItem
  ↓
<audio ref={audioRef} autoPlay playsInline />
  ↓
useEffect sets audio.srcObject = participant.stream
  ↓
audio.play() called
  ↓
Browser plays remote audio through speakers ← USER HEARS AUDIO
```

## Testing Checklist

### Before Testing
- [ ] Ensure two users are in the same room
- [ ] Both users should have microphone access granted
- [ ] Check browser console for errors

### Test Steps
1. **User A starts voice**
   - Check console: Should see "[Voice] Requesting microphone access..."
   - Check console: Should see "[Voice] Got microphone stream"
   - Check Firestore: User A's participant should have `isVoiceActive: true`

2. **User B starts voice**
   - Check console: Same messages as User A
   - Check Firestore: User B's participant should have `isVoiceActive: true`

3. **Peer Connection**
   - Check console: Should see "[Voice] Calling peer: [peerId]"
   - Check console: Should see "[Voice] Incoming call from: [peerId]"
   - Check console: Should see "[Voice] Received remote stream from: [peerId]"

4. **Audio Playback**
   - Check console: Should see "[Voice] Audio playing for: [userName]"
   - User A speaks into microphone → User B should hear audio
   - User B speaks into microphone → User A should hear audio

### Common Issues

#### "Permission denied" for microphone
- Browser blocked microphone access
- User needs to grant permission in browser settings

#### "Cannot answer call - no local stream"
- User B clicked "Start Voice" AFTER User A tried to connect
- Solution: User B should start voice first, or User A should refresh after User B starts

#### Peer connection but no audio
- Check audio element in DevTools (should show srcObject set)
- Check browser's autoplay policy
- Check system volume and browser volume

#### Audio detection animations not showing
- Separate issue - audio PLAYBACK should work regardless
- Animations require Web Audio API analyzers (different from playback)

## Key Learnings

1. **Always update Firestore when local state changes** - Other users rely on Firestore for real-time sync
2. **Audio elements need explicit configuration** - volume, muted, playsInline all matter
3. **Browser autoplay policies are strict** - Need user interaction and proper attributes
4. **Log everything during development** - Impossible to debug WebRTC without comprehensive logs

## Next Steps

- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Add connection quality indicators
- [ ] Add reconnection logic for dropped connections
- [ ] Remove debug logs after confirming it works
