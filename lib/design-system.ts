/**
 * Design System Library
 * Based on Piku template colors, fonts, and spacing
 * Extracted from template analysis for consistent usage across components
 */

/**
 * ACTUAL Piku Template Colors
 * Extracted directly from: Piku - Creative Saas & Software HTML5 Template.html
 *
 * Usage patterns observed in template:
 * - Card backgrounds: yellow-light, mint, purple-light
 * - Integration logos: All vibrant colors rotating
 * - Borders/accents: teal, gold, pink, orange-accent, pink-hot
 * - Dark theme: piku-dark (#0D1A1C)
 */
export const colors = {
  // Exact Piku template colors (from HTML analysis)
  piku: {
    // Card background colors (used for feature blocks)
    'yellow-light': '#FFEB80',      // "Track Project" card
    'mint': '#76FFCE',              // "Plan Project" card
    'purple-light': '#D3A7FF',      // "Team Collaboration" card
    'purple-dark': '#9F54FF',       // Integration logo box
    'cyan': '#31D9EC',              // Integration logo box
    'magenta': '#FE65E5',           // Integration logo box
    'green': '#4EE265',             // Integration logo box
    'yellow-gold': '#F5DC00',       // Integration logo box
    'orange': '#FF7F54',            // Integration logo box
    'blue': '#24CAFF',              // Integration logo box
    'lime': '#91C400',              // Integration logo box

    // Accent colors (used for borders, icons, highlights)
    'teal': '#20E8C4',              // Border accent (pricing card 1)
    'gold': '#FFD542',              // Border accent & icon (stats)
    'pink': '#EF62E9',              // Border accent & icon (stats)
    'orange-accent': '#FFC736',     // Border accent (pricing card 2)
    'pink-hot': '#FF56BB',          // Border accent (pricing card 3)

    // Theme colors
    'dark': '#0D1A1C',              // Primary dark background (from meta theme-color)
    'cyan-accent': '#00DBE4',       // Stats icon color
  },

  // Pastel Palette (from Testmanship Android app)
  pastel: {
    yellow: '#F7D794',
    ocean: '#778BEB',
    coral: '#EB8686',
    blossom: '#F8A5C2',
    aqua: '#64CDDB',
    slate: '#596174',
  },

  // Feedback card colors (from testimonials section)
  feedback: {
    yellow: '#FFDA7C',              // Testimonial card background
    pink: '#FF90ED',                // Testimonial card background
    cyan: '#85F8F1',                // Testimonial card background
  },

  // Neutral colors
  neutral: {
    dark: '#0D1A1C',
    light: '#F5F5F5',
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;

export const typography = {
  // Font families (Piku uses Manrope + system fonts)
  fontFamily: {
    primary: 'var(--font-inter)',
    secondary: 'var(--font-manrope)',
    mono: 'monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.75rem', // 28px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

export const spacing = {
  // Based on 4px grid system
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const shadows = {
  // Piku uses minimal shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const;

/**
 * Color Pairings from Piku Template
 * These are the ACTUAL combinations used in the Piku template
 */
export const colorPairings = {
  // Feature card combinations (from "Track Project" section)
  yellowCard: {
    background: colors.piku['yellow-light'],   // #FFEB80
    text: colors.neutral.dark,                  // Dark text on light yellow
    accent: colors.piku.gold,                   // #FFD542
  },
  mintCard: {
    background: colors.piku.mint,               // #76FFCE
    text: colors.neutral.dark,                  // Dark text on mint
    accent: colors.piku.green,                  // #4EE265
  },
  purpleCard: {
    background: colors.piku['purple-light'],    // #D3A7FF
    text: colors.neutral.dark,                  // Dark text on lavender
    accent: colors.piku['purple-dark'],         // #9F54FF
  },

  // Pricing card borders (from pricing section)
  pricingTeal: {
    border: colors.piku.teal,                   // #20E8C4
    background: colors.neutral.white,
    text: colors.neutral.dark,
  },
  pricingOrange: {
    border: colors.piku['orange-accent'],       // #FFC736
    background: colors.neutral.white,
    text: colors.neutral.dark,
  },
  pricingPink: {
    border: colors.piku['pink-hot'],            // #FF56BB
    background: colors.neutral.white,
    text: colors.neutral.dark,
  },

  // Testimonial cards (from feedback section)
  testimonialYellow: {
    background: colors.feedback.yellow,         // #FFDA7C
    text: colors.neutral.dark,
  },
  testimonialPink: {
    background: colors.feedback.pink,           // #FF90ED
    text: colors.neutral.dark,
  },
  testimonialCyan: {
    background: colors.feedback.cyan,           // #85F8F1
    text: colors.neutral.dark,
  },

  // Stats icons (from hero section)
  statsCyan: {
    border: colors.piku['cyan-accent'],         // #00DBE4
    color: colors.piku['cyan-accent'],
  },
  statsGold: {
    border: colors.piku.gold,                   // #FFD542
    color: colors.piku.gold,
  },
  statsPink: {
    border: colors.piku.pink,                   // #EF62E9
    color: colors.piku.pink,
  },
} as const;

// Animation durations
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Breakpoints (mobile-first)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type ColorPairing = keyof typeof colorPairings;
export type BrandColor = keyof typeof colors.brand;
export type PastelColor = keyof typeof colors.pastel;
