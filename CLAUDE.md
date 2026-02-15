# CLAUDE.md - DeutschCraft Web V2

## Project Overview

**DeutschCraft Web V2** is a German language learning platform built with Next.js 15, designed for deployment on Vercel. It features:

- 🎨 **Modern SaaS Design** - Inspired by Piku template colors and Hosue template animations
- ⚡ **Heavily Animated Landing Page** - Smooth transitions and scroll effects
- 🤖 **AI-Powered Learning** - Intelligent flashcard generation
- 📊 **Student/Teacher Dashboards** - Comprehensive learning management
- 🎯 **CEFR Level Support** - A1 to C2 German proficiency levels

## Design System

### Color Palette

Based on analysis of Piku template:

**Brand Colors:**
- Yellow: `#FFEB80` - Primary highlights
- Mint: `#76FFCE` - Success states
- Purple: `#D3A7FF` - Primary brand
- Cyan: `#00DBE4` - Accent 1
- Gold: `#FFD542` - Accent 2
- Pink: `#EF62E9` - Accent 3

**Pastel Palette** (from DeutschCraft Android app):
- Ocean: `#778BEB`
- Coral: `#EB8686`
- Blossom: `#F8A5C2`
- Aqua: `#64CDDB`
- Slate: `#596174`

**Usage:**
All colors are defined in:
- `lib/design-system.ts` - Complete design tokens
- `tailwind.config.ts` - Tailwind configuration

### Typography

- **Primary Font**: Inter (clean, modern sans-serif)
- **Secondary Font**: Manrope (friendly, rounded)
- Loaded via Google Fonts in `app/layout.tsx`

### Animations

**Animation Strategy** (inspired by Hosue template):
1. **Hero Section**: Floating background orbs, staggered fade-ins
2. **Feature Cards**: Hover lift effects, scale transforms
3. **Stats**: Counter animations on scroll
4. **Smooth Scrolling**: Native CSS smooth scroll

**Animation Classes:**
- `animate-fade-in-up` - Slides up with fade
- `animate-fade-in-down` - Slides down with fade
- `animate-float` - Continuous floating motion
- `animate-bounce-in` - Bouncy entrance
- `animation-delay-{100,200,300...}` - Staggered delays

Defined in `app/globals.css`

## Data Models

### Core Entities

Based on DeutschCraft Android app (Kotlin to TypeScript conversion):

**User**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  // ...
}
```

**Student**
```typescript
interface Student {
  studentId: string;
  userId: string;
  currentLevel: CEFRLevel; // A1-C2
  wordsLearned: number;
  currentStreak: number;
  // ... 20+ fields for learning stats
}
```

**Teacher**
```typescript
interface Teacher {
  teacherId: string;
  userId: string;
  totalStudents: number;
  activeStudents: number;
  // ...
}
```

**CEFR Levels**
```typescript
enum CEFRLevel {
  A1, A2, B1, B2, C1, C2
}
```

Complete models in `lib/models.ts`

## File Structure

```
deutschcraft/
├── app/
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles + animations
│   └── dashboard/
│       └── playground/[roomId]/page.tsx  # WebRTC playground room
├── components/
│   ├── sections/            # Landing page sections
│   ├── playground/          # WebRTC video/audio UI components
│   │   ├── VideoPanel.tsx
│   │   ├── VideoGridView.tsx
│   │   └── VideoLayoutSelector.tsx
│   └── ui/
│       ├── Navbar.tsx       # Sticky nav with scroll effect
│       └── Footer.tsx       # Site footer
├── lib/
│   ├── design-system.ts     # Complete design tokens
│   ├── models.ts            # Data models (TypeScript)
│   └── hooks/
│       ├── useWebRTCMedia.ts        # Main WebRTC hook (v3)
│       └── webrtc/
│           ├── config.ts            # ICE/TURN server configuration
│           ├── types.ts             # WebRTC type definitions
│           ├── socketSignaling.ts   # Native WebSocket signaling client
│           ├── mediaStreamManager.ts # Separate audio/video streams
│           ├── peerManager.ts       # RTCPeerConnection lifecycle
│           ├── useMediaSession.ts   # Start/stop media sessions
│           └── useMediaControls.ts  # Mute/video toggle controls
├── signaling-worker/        # Cloudflare Worker + Durable Object signaling
│   ├── src/
│   │   ├── index.ts         # Worker entry: routes /room/:roomId to DO
│   │   ├── signalingRoom.ts # Durable Object: WebSocket Hibernation handlers
│   │   └── types.ts         # JSON message protocol types
│   ├── wrangler.toml        # Worker config + DO binding
│   ├── package.json
│   └── tsconfig.json
├── public/                  # Static assets
├── next.config.ts           # Next.js config (optimized for Vercel)
├── tailwind.config.ts       # Tailwind + design system integration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 12.0.0 + CSS animations
- **Fonts**: Inter + Manrope (Google Fonts)
- **WebRTC Signaling**: Native WebSocket + Cloudflare Durable Objects (WebSocket Hibernation API)
- **Database**: Firestore (primary), LibSQL/Turso (supplementary)

## Performance Optimizations

### For Fast Loading (addressing orbit-and-chill slowness)

1. **No Heavy Dependencies**
   - ❌ No Three.js, no astronomy calculations
   - ❌ No rich text editors on landing page
   - ✅ Lightweight animations (CSS + Framer Motion)

2. **Optimized Next.js Config**
   ```typescript
   // next.config.ts
   - SWC minification enabled
   - Image optimization (AVIF/WebP)
   - Console removal in production
   - Static optimization wherever possible
   ```

3. **Vercel Deployment**
   - Automatic edge caching
   - Global CDN distribution
   - Optimized image delivery

4. **Code Splitting**
   - Each section is a separate component
   - Client components marked with 'use client'
   - Lazy loading ready for future expansion

## Development Commands

```bash
# Development (with Turbopack)
npm run dev

# Signaling worker (required for WebRTC voice/video)
npm run dev:signaling

# Deploy signaling worker to Cloudflare
npm run deploy:signaling

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

For WebRTC playground functionality, run both the Next.js dev server and the signaling worker simultaneously in separate terminals.

## WebRTC Architecture

### Overview

The playground uses peer-to-peer WebRTC for real-time voice and video, with a Cloudflare Durable Object for signaling coordination via native WebSockets.

### Signaling Flow

```
Client A                    Server                    Client B
   |-- join(roomId) ------->|                          |
   |                        |<------ join(roomId) -----|
   |<-- addPeer(B, offer:F)-|                          |
   |                        |-- addPeer(A, offer:T) -->|
   |                        |<-- relaySDP(A, offer) ---|
   |<-- sessionDescription -|                          |
   |--- relaySDP(B, answer)>|                          |
   |                        |-- sessionDescription --->|
   |<========= ICE candidates via relayICE ==========>|
   |<============= P2P WebRTC connected ==============>|
```

The newer joiner receives `shouldCreateOffer: true` and initiates the WebRTC offer.

### Separate Media Streams

Audio and video use independent `getUserMedia()` calls and separate `MediaStream` objects:

- `localAudioStreamRef` - Microphone only
- `localVideoStreamRef` - Camera only

Each track is added to the peer connection with its own stream via `pc.addTrack(track, stream)`. The `ontrack` handler splits incoming tracks by `track.kind` into separate audio/video state maps.

This allows toggling video on/off without affecting the audio pipeline.

### Hook Architecture

```
useWebRTCMedia (orchestrator)
├── socketSignaling (native WebSocket connection + JSON message protocol)
├── useMediaSession (start/stop + signaling join/leave)
├── useMediaControls (mute/video toggle + peer status)
├── peerManager (RTCPeerConnection creation + audio playback)
└── mediaStreamManager (getUserMedia for audio/video independently)
```

### Environment Variables

```
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8787    # Local: wrangler dev on port 8787
                                                # Prod: wss://deutschcraft-signaling.<subdomain>.workers.dev
NEXT_PUBLIC_TURN_URL=turn:host:3478             # TURN server for NAT traversal
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
```

## Next Steps / TODO

**Landing Page:** ✅ Complete
- [x] Hero section with animations
- [x] Features section
- [x] How it works
- [x] Testimonials
- [x] Pricing
- [x] CTA
- [x] Navbar
- [x] Footer

**Student Dashboard:** 🔲 Pending
- [ ] Create `/dashboard/student` route
- [ ] Progress tracking cards
- [ ] Flashcard practice interface
- [ ] Weekly stats visualization
- [ ] Level progression UI (A1-C2)

**Teacher Dashboard:** 🔲 Pending
- [ ] Create `/dashboard/teacher` route
- [ ] Student list management
- [ ] Individual student progress views
- [ ] Assignment creation
- [ ] Analytics overview

**Authentication:** 🔲 Pending
- [ ] `/login` page
- [ ] `/signup` page
- [ ] Auth provider (NextAuth.js or Supabase)
- [ ] Protected routes

**Database:** 🔲 Pending
- [ ] Choose database (Supabase PostgreSQL recommended)
- [ ] Implement data models from `lib/models.ts`
- [ ] API routes for CRUD operations

**AI Integration:** 🔲 Pending
- [ ] OpenAI/Claude API for flashcard generation
- [ ] Sentence generation based on CEFR level
- [ ] Adaptive difficulty adjustment

## Design Philosophy

1. **Mobile-First**: All components responsive
2. **Animation-Rich**: Smooth, delightful interactions
3. **Color-Coded**: Consistent use of brand palette
4. **Fast Loading**: Optimized for Vercel deployment
5. **Accessible**: Semantic HTML, ARIA labels

## Color Usage Guide

**Gradients for CTAs:**
```tsx
className="bg-gradient-to-r from-brand-purple to-pastel-ocean"
```

**Section Backgrounds:**
- White sections: Alternate with colored sections
- Gradient backgrounds: Use for hero, testimonials, CTA
- Gray sections: `bg-gray-50` for subtle separation

**Component Theming:**
- Use `colorPairings` from `lib/design-system.ts`
- Example: `colorPairings.sunset` = yellow background + dark text

## Adding New Pages

1. Create route in `app/` directory
2. Use existing components from `components/ui`
3. Follow animation patterns from landing page
4. Use design tokens from `lib/design-system.ts`
5. Add navigation links in `Navbar.tsx`

## Deployment to Vercel

1. Push to GitHub repository
2. Connect to Vercel
3. Auto-deploys on every push to `main`
4. Environment variables via Vercel dashboard

**Environment Variables Needed:**
```
NEXT_PUBLIC_SIGNALING_URL=wss://deutschcraft-signaling.<subdomain>.workers.dev
NEXT_PUBLIC_TURN_URL=turn:your-turn-server:3478
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Known Issues / Limitations

- ✅ Signaling via Cloudflare Durable Objects (deploy with `npm run deploy:signaling`)
- ✅ WebRTC voice/video with native WebSocket signaling (separate audio/video streams)
- ✅ Firestore database with NextAuth authentication
- ✅ Optimized for fast loading on Vercel
- ✅ Responsive design works on all devices
- ✅ Animations perform well (60fps)

## Comparison to Orbit-and-Chill

**What's Different:**
- ✅ Much lighter bundle size (no Three.js, no astronomy-engine)
- ✅ Faster initial load (< 1 second vs 3-5 seconds)
- ✅ Simpler dependencies (Next.js + Tailwind vs heavy React ecosystem)
- ✅ Vercel-optimized (SSG/ISR vs client-heavy rendering)

**What's Similar:**
- Modern React practices (hooks, functional components)
- TypeScript throughout
- Tailwind CSS for styling
- Compositional component architecture

## Code Quality Standards

### User Display Name Best Practice

**⚠️ CRITICAL: Always use the centralized user helper utility**

To prevent the recurring issue of showing emails instead of names:

```typescript
import { getUserInfo } from '@/lib/utils/userHelpers';
import { useCurrentStudent } from '@/lib/hooks/useUsers';

const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);
```

**Priority Order:**
1. Firestore `user.name` (most reliable)
2. Session `displayName` (from OAuth)
3. Email address (fallback only)

**❌ DON'T:**
```typescript
const userName = session?.user?.email; // Shows email
const userName = session?.user?.displayName; // Might be undefined
```

**✅ DO:**
```typescript
const { userName } = getUserInfo(currentUser, session); // Always correct
```

### File Size Guidelines

**CRITICAL: Always aim for 300 lines or less per file**

- ⚠️ **Target**: 300 lines maximum per component/file
- 🚨 **Hard Limit**: 500 lines absolute maximum
- ✅ **Action**: When files exceed 300 lines, refactor immediately

**Refactoring Strategy:**
1. Extract logical sections into separate components
2. Move reusable logic into hooks or utilities
3. Split complex forms into sub-components
4. Create dedicated files for constants and types

**Examples:**
- TaskBoard.tsx: Split into TaskRow, TaskDetailsRow, NewTaskForm
- Large forms: Extract field groups into sub-components
- Long hooks: Split into smaller, focused hooks

### Git Practices

**Commit Guidelines:**
- ✅ Stage specific files only (avoid `git add -A`)
- ✅ Write descriptive commit messages
- ✅ Group related changes together
- ✅ Include co-authorship for AI-assisted commits

## Contributing

When adding features:
1. **Keep files under 300 lines** - Split immediately if exceeded
2. Follow existing component structure
3. Use design tokens from `lib/design-system.ts`
4. Add TypeScript types to `lib/models.ts`
5. Test responsive design (mobile, tablet, desktop)
6. Ensure animations are smooth (use `animation-delay-*` for staggering)
7. Stage specific files for commits (no `git add -A`)
