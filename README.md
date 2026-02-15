# DeutschCraft Web V2

German language learning platform with AI-powered flashcards and adaptive learning.

## Features

- 🎨 **Beautiful Design**: Inspired by modern SaaS templates with vibrant colors
- ⚡ **Heavily Animated**: Smooth transitions and animations throughout
- 🤖 **AI-Powered**: Intelligent flashcard generation
- 📊 **Progress Tracking**: Real-time analytics and insights
- 🎯 **CEFR Levels**: Support for A1 to C2 proficiency levels
- 👨‍🏫 **Teacher Dashboard**: Manage students and track progress
- 📱 **Responsive**: Works on all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion + CSS animations
- **Fonts**: Inter & Manrope (Google Fonts)
- **Database**: Firestore (primary) + Turso/LibSQL (supplementary)
- **Auth**: NextAuth.js with Google OAuth
- **WebRTC**: Peer-to-peer voice/video with Cloudflare Durable Objects signaling
- **Deployment**: Optimized for Vercel

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Turso and Firebase credentials

# 3. Run database migrations
npm run db:migrate

# 4. Start development server
npm run dev
# Opens at http://localhost:3001
```

**First time setup?** Read the complete [Getting Started Guide](./docs/guides/GETTING_STARTED.md)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Getting Started](./docs/guides/GETTING_STARTED.md)** - Complete setup guide for developers, teachers, and students
- **[Database Setup](./docs/guides/DATABASE_SETUP.md)** - Turso + Firestore dual-database configuration
- **[Flashcards System](./docs/guides/FLASHCARDS_SYSTEM.md)** - Flashcard management & SRS algorithm
- **[Cache Invalidation](./docs/technical/CACHE_INVALIDATION.md)** - Multi-layered cache strategy
- **[Architecture](./docs/technical/COMPONENTS.md)** - Component structure and patterns

**View all documentation**: [docs/README.md](./docs/README.md)

## Design System

The project uses a comprehensive design system based on:
- **Colors**: Piku template color palette (see `lib/design-system.ts`)
- **Animations**: Hosue template animation patterns
- **Components**: Reusable, themed components

### Color Palette

- **Brand Colors**: Yellow, Mint, Purple, Cyan, Gold, Pink, etc.
- **Pastel Colors**: Ocean, Coral, Blossom, Aqua, Slate
- **Feedback Colors**: Yellow, Pink, Cyan

See `lib/design-system.ts` for complete color specifications.

## Data Models

Based on the DeutschCraft Android app with support for:

- **Users**: Students and Teachers
- **CEFR Levels**: A1, A2, B1, B2, C1, C2
- **Vocabulary**: German words with translations
- **Flashcards**: Multiple question types
- **Progress Tracking**: SRS algorithm, stats, streaks

See `lib/models.ts` for complete data models.

## Project Structure

```
deutschcraft/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles + animations
│   └── dashboard/         # Student & teacher dashboards
├── components/            # React components
│   ├── sections/          # Landing page sections
│   ├── playground/        # WebRTC video/audio UI
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configs
│   ├── brand-config.ts    # Centralized brand configuration
│   ├── design-system.ts   # Design tokens
│   ├── models/            # Data models
│   ├── hooks/             # React hooks (incl. WebRTC)
│   └── services/          # Firestore & Turso services
├── signaling-worker/      # Cloudflare Worker for WebRTC signaling
├── turso/                 # Turso database migrations
├── scripts/               # Utility & data scripts
├── public/                # Static assets
└── package.json           # Dependencies
```

## Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run dev:signaling` - Start WebRTC signaling worker locally
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Turso database migrations

## Deployment

Optimized for Vercel deployment with:
- Automatic image optimization (AVIF/WebP)
- SWC minification
- Production console removal
- Fast builds with Turbopack

Deploy with one click on [Vercel](https://vercel.com).

## License

Private - DeutschCraft © 2025-2026
