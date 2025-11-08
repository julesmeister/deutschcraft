# Testmanship Web V2

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

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion + CSS animations
- **Fonts**: Inter & Manrope (Google Fonts)
- **Deployment**: Optimized for Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

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

Based on the Testmanship Android app with support for:

- **Users**: Students and Teachers
- **CEFR Levels**: A1, A2, B1, B2, C1, C2
- **Vocabulary**: German words with translations
- **Flashcards**: Multiple question types
- **Progress Tracking**: SRS algorithm, stats, streaks

See `lib/models.ts` for complete data models.

## Project Structure

```
testmanship-web-v2/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── sections/          # Page sections
│   └── ui/                # UI components
├── lib/                   # Utilities and configs
│   ├── design-system.ts   # Design tokens
│   └── models.ts          # Data models
├── public/                # Static assets
└── package.json           # Dependencies
```

## Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

Optimized for Vercel deployment with:
- Automatic image optimization (AVIF/WebP)
- SWC minification
- Production console removal
- Fast builds with Turbopack

Deploy with one click on [Vercel](https://vercel.com).

## License

Private - Testmanship © 2025
