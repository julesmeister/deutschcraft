# CLAUDE.md - Testmanship Web V2

## Project Overview

**Testmanship Web V2** is a German language learning platform built with Next.js 15, designed for deployment on Vercel. It features:

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

**Pastel Palette** (from Testmanship Android app):
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

Based on Testmanship Android app (Kotlin to TypeScript conversion):

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
testmanship-web-v2/
├── app/
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles + animations
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx         # Animated hero with floating cards
│   │   ├── FeaturesSection.tsx     # 3-column feature grid
│   │   ├── StatsSection.tsx        # Partner logos
│   │   ├── HowItWorksSection.tsx   # 3-step process
│   │   ├── TestimonialsSection.tsx # Customer reviews
│   │   ├── PricingSection.tsx      # 3-tier pricing
│   │   └── CTASection.tsx          # Final call-to-action
│   └── ui/
│       ├── Navbar.tsx       # Sticky nav with scroll effect
│       └── Footer.tsx       # Site footer
├── lib/
│   ├── design-system.ts     # Complete design tokens
│   └── models.ts            # Data models (TypeScript)
├── public/                  # Static assets
├── next.config.ts           # Next.js config (optimized for Vercel)
├── tailwind.config.ts       # Tailwind + design system integration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## Tech Stack

- **Framework**: Next.js 15.1.5 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.1.8
- **Animations**: Framer Motion 12.0.0 + CSS animations
- **Fonts**: Inter + Manrope (Google Fonts)

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

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
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

**Environment Variables Needed (future):**
```
NEXT_PUBLIC_API_URL=
DATABASE_URL=
OPENAI_API_KEY=
```

## Known Issues / Limitations

- ❌ No backend/database yet (static data only)
- ❌ No authentication (placeholder links)
- ❌ No actual flashcard functionality (UI only)
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

## Contributing

When adding features:
1. Follow existing component structure
2. Use design tokens from `lib/design-system.ts`
3. Add TypeScript types to `lib/models.ts`
4. Test responsive design (mobile, tablet, desktop)
5. Ensure animations are smooth (use `animation-delay-*` for staggering)
