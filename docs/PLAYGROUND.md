# Playground Feature Documentation

## Overview

The **Playground** is a collaborative learning environment where teachers and students can interact in real-time through **voice chat** and **collaborative writing**. It's designed for German language practice with features like voice communication and controlled visibility of student work.

## Features

### 🎙️ Voice Chat
- **Peer-to-peer audio** using PeerJS/WebRTC
- **Start/Stop voice** with one click
- **Mute/Unmute** controls
- **Live participant indicators** showing who's speaking
- Automatic peer connection management

### ✍️ Writing Board
- **Individual writing spaces** for each participant
- **Real-time synchronization** using Firebase/Firestore
- **Visibility controls:**
  - Students can only see their own work by default
  - Teachers can see ALL student writings
  - Teachers can make individual writings public
  - Teachers can toggle room-wide public writing mode
- **Word count tracking**
- **Auto-save drafts**

### 👥 Room Management
- **Teachers** can create rooms
- **Students and Teachers** can join active rooms
- **Live participant list** with role indicators
- **Room status tracking** (active/ended)

## Technology Stack

### Voice Communication
- **PeerJS** - WebRTC wrapper for peer-to-peer audio
- **Free PeerJS Cloud Server** for signaling (development)
- STUN servers for NAT traversal (Google, Twilio)

### Database Layer
- **Current:** Firebase Firestore (real-time subscriptions)
- **Future-ready:** Abstracted service layer for Turso migration
- Real-time listeners for participants, writings, and room state

### Frontend
- React hooks for voice management (`useVoiceChat`)
- Real-time UI updates with Firebase listeners
- Responsive design matching writing exercise UI

## File Structure

```
testmanship-web-v2/
├── lib/
│   ├── models/
│   │   └── playground.ts              # TypeScript interfaces
│   ├── services/
│   │   └── playgroundService.ts       # Database abstraction layer
│   ├── hooks/
│   │   └── useVoiceChat.ts            # PeerJS voice hook
│   └── config/
│       └── peerjs.ts                  # PeerJS configuration
├── components/
│   └── playground/
│       ├── VoicePanel.tsx             # Voice controls + participant list
│       └── WritingBoard.tsx           # Collaborative writing interface
├── app/
│   └── dashboard/
│       └── playground/
│           └── page.tsx               # Main Playground page
└── docs/
    └── PLAYGROUND.md                  # This file
```

## Database Schema (Firestore)

### Collections

#### `playground_rooms`
```typescript
{
  roomId: string (auto-generated)
  title: string
  hostId: string
  hostName: string
  status: 'active' | 'ended'
  createdAt: Timestamp
  endedAt?: Timestamp
  participantCount: number
  isPublicWriting: boolean
}
```

#### `playground_participants`
```typescript
{
  participantId: string (auto-generated)
  roomId: string
  userId: string
  userName: string
  userEmail: string
  role: 'teacher' | 'student'
  joinedAt: Timestamp
  leftAt?: Timestamp
  isVoiceActive: boolean
  isMuted: boolean
  peerId?: string
}
```

#### `playground_writings`
```typescript
{
  writingId: string (auto-generated)
  roomId: string
  userId: string
  userName: string
  content: string
  isPublic: boolean
  wordCount: number
  createdAt: Timestamp
  lastUpdatedAt: Timestamp
}
```

#### `playground_messages` (Optional)
```typescript
{
  messageId: string (auto-generated)
  roomId: string
  userId: string
  userName: string
  message: string
  type: 'text' | 'system'
  timestamp: Timestamp
}
```

## User Flows

### Teacher Flow

1. **Navigate to Playground** (from navbar: Student > Practice > Playground)
2. **Create a new room**
   - Click "Create New Room"
   - Room is created with teacher as host
3. **Start voice chat** (optional)
   - Click "Start Voice"
   - Grant microphone permissions
4. **Wait for students to join**
5. **View student writings**
   - All student work is visible to teachers
   - Toggle individual writings to public/private
   - Toggle room-wide public writing mode
6. **End the room** when done
   - Click "End Room"
   - All participants are disconnected

### Student Flow

1. **Navigate to Playground**
2. **Join an active room**
   - See list of available rooms
   - Click "Join Room"
3. **Start voice chat** (optional)
   - Click "Start Voice"
   - Grant microphone permissions
4. **Write in German**
   - Use the Writing Board
   - Content auto-saves
   - Only visible to teacher unless made public
5. **View public writings** (if enabled)
   - See other students' work if teacher made it public
6. **Leave room** when done

## Voice Chat Technical Details

### How PeerJS Works

1. **Signaling Server**
   - PeerJS Cloud server coordinates connections
   - Each user gets a unique `peerId`

2. **Peer Discovery**
   - Users announce their `peerId` via Firestore
   - Others connect directly using these IDs

3. **Audio Streaming**
   - WebRTC handles actual audio transfer
   - STUN servers help with NAT traversal
   - Direct peer-to-peer (no server relay)

### Connection Flow

```
User A                    Firestore                User B
  |                          |                        |
  |--Register peerId-------->|                        |
  |                          |<---Query participants--|
  |                          |---Send peerId--------->|
  |<------Direct WebRTC Connection Established------->|
  |                  Audio Stream                     |
```

### Microphone Permissions

- Browser prompts for mic access on "Start Voice"
- Permission is required for voice to work
- Users can mute/unmute even after granting access

## Writing Visibility Rules

| Viewer Role | Own Writing | Other Students' Writing | Teacher's Writing |
|-------------|-------------|-------------------------|-------------------|
| **Student** | ✅ Always   | ✅ If public            | ✅ If public      |
| **Teacher** | ✅ Always   | ✅ Always               | ✅ Always         |

### Visibility Controls

1. **Room-wide Public Mode** (Teacher only)
   - Toggle: "All Writings Public" / "Writings Private"
   - When enabled: All writings become visible to everyone
   - When disabled: Only teacher can see all writings

2. **Individual Writing Visibility** (Teacher only)
   - Click "Make Public" on any student's writing
   - That specific writing becomes visible to all students
   - Useful for showcasing good examples

## Migration to Turso (Future)

The service layer (`playgroundService.ts`) is designed to be database-agnostic:

### Current: Firestore
```typescript
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
```

### Future: Turso
```typescript
import { db } from '@/lib/turso';
// Replace Firestore calls with Turso SQL queries
// Use polling or WebSockets for real-time updates
```

### Migration Steps

1. Create Turso tables matching Firestore collections
2. Implement SQL queries in `playgroundService.ts`
3. Replace `onSnapshot` with polling/WebSocket listeners
4. Update Firebase imports to Turso
5. Test with dual-write (Firestore + Turso) before full switch

### Turso Schema (SQL)

```sql
-- Rooms
CREATE TABLE playground_rooms (
  room_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL,
  ended_at INTEGER,
  participant_count INTEGER DEFAULT 0,
  is_public_writing BOOLEAN DEFAULT 0
);

-- Participants
CREATE TABLE playground_participants (
  participant_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  left_at INTEGER,
  is_voice_active BOOLEAN DEFAULT 0,
  is_muted BOOLEAN DEFAULT 0,
  peer_id TEXT,
  FOREIGN KEY (room_id) REFERENCES playground_rooms(room_id)
);

-- Writings
CREATE TABLE playground_writings (
  writing_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_updated_at INTEGER NOT NULL,
  FOREIGN KEY (room_id) REFERENCES playground_rooms(room_id)
);
```

## Configuration

### PeerJS Server Options

**Option 1: Free PeerJS Cloud** (Current)
```typescript
host: 'peerjs-server.herokuapp.com',
port: 443,
path: '/',
secure: true,
```

**Option 2: Self-Hosted PeerServer**
```bash
npm install peer
npx peerjs --port 9000 --path /peerjs
```

Then update config:
```typescript
host: 'your-domain.com',
port: 9000,
path: '/peerjs',
```

**Option 3: Cloudflare Workers** (Production-grade)
- Deploy PeerJS server on Cloudflare Workers
- No server maintenance
- Global edge network

### STUN/TURN Servers

Currently using free STUN servers:
```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
]
```

For production, consider adding TURN servers (for restrictive firewalls):
```typescript
{
  urls: 'turn:your-turn-server.com:3478',
  username: 'user',
  credential: 'pass'
}
```

## Troubleshooting

### Voice Chat Issues

**Problem:** Can't hear other participants
- Check microphone permissions in browser
- Verify `isVoiceActive` is true for both users
- Check browser console for WebRTC errors
- Test STUN connectivity: `chrome://webrtc-internals`

**Problem:** Connection fails between peers
- Firewall/NAT may be blocking WebRTC
- Add TURN server for relay fallback
- Check PeerJS server status

### Writing Board Issues

**Problem:** Changes not syncing
- Check Firebase connection
- Verify user is authenticated
- Check browser console for Firestore errors

**Problem:** Can't see other students' writings
- Verify writing is marked as public
- Check room's `isPublicWriting` flag
- Confirm user role is correct

## Performance Considerations

### Voice Chat
- **Bandwidth:** ~50 kbps per audio connection
- **Scalability:** Works best with 2-10 participants
- **Latency:** ~100-200ms typical WebRTC latency

### Database Reads
- Real-time listeners for room state (~3-5 reads/second)
- One-time reads for initial room list
- Optimized queries with indexes

### Optimization Tips
1. Limit room size to 10 participants
2. Use Firestore indexes for queries
3. Debounce writing auto-save (every 3-5 seconds)
4. Close connections on page unload

## Security Considerations

1. **Authentication Required**
   - All operations require Firebase auth
   - User role determines permissions

2. **Authorization**
   - Teachers can create/end rooms
   - Students can only join existing rooms
   - Writing visibility enforced server-side

3. **Data Validation**
   - Validate user roles before writes
   - Sanitize user input
   - Rate-limit room creation

## Future Enhancements

- [ ] **Text chat** alongside voice
- [ ] **Screen sharing** for presentations
- [ ] **Teacher annotations** on student writing
- [ ] **Recording** sessions for review
- [ ] **Breakout rooms** for group work
- [ ] **Whiteboard** for drawing/diagrams
- [ ] **File sharing** (PDFs, images)
- [ ] **Session replay** for teachers
- [ ] **Analytics** on participation time
- [ ] **Mobile app** version

## Testing Checklist

### Voice Chat
- [x] Start voice grants microphone access
- [x] Mute/unmute works correctly
- [x] Stop voice releases microphone
- [x] Participants see each other in voice list
- [ ] Audio quality is clear (subjective)
- [ ] Multiple participants can talk simultaneously

### Writing Board
- [x] Student can write and save
- [x] Teacher sees all student writings
- [x] Public/private toggle works
- [x] Room-wide public mode works
- [x] Word count updates correctly
- [ ] Auto-save prevents data loss

### Room Management
- [x] Teacher can create room
- [x] Student can join room
- [x] Participant count updates
- [x] Leave room works
- [x] End room kicks all participants

## Support

For issues or questions:
- Check browser console for errors
- Review Firebase logs
- Check PeerJS connection status
- Verify microphone permissions

## License

Part of Testmanship Web V2 - German Language Learning Platform
