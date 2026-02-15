import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/brand-config.ts",
  ],
  theme: {
    extend: {
      // ACTUAL Piku template color palette (extracted from HTML)
      colors: {
        // Primary Piku colors (exact values from template)
        piku: {
          // Background card colors
          'yellow-light': '#FFEB80',      // Sunshine yellow card
          'mint': '#76FFCE',              // Mint green card
          'purple-light': '#D3A7FF',      // Lavender purple card
          'purple-dark': '#9F54FF',       // Deep purple
          'cyan': '#31D9EC',              // Bright cyan
          'magenta': '#FE65E5',           // Hot magenta
          'green': '#4EE265',             // Bright green
          'yellow-gold': '#F5DC00',       // Golden yellow
          'orange': '#FF7F54',            // Coral orange
          'blue': '#24CAFF',              // Sky blue
          'lime': '#91C400',              // Lime green

          // Accent/border colors
          'teal': '#20E8C4',              // Teal accent
          'gold': '#FFD542',              // Gold accent
          'pink': '#EF62E9',              // Pink accent
          'orange-accent': '#FFC736',     // Orange accent
          'pink-hot': '#FF56BB',          // Hot pink accent

          // Theme colors
          'dark': '#0D1A1C',              // Main dark background
        },
        // Keep pastel colors for compatibility
        pastel: {
          yellow: '#F7D794',
          ocean: '#778BEB',
          coral: '#EB8686',
          blossom: '#F8A5C2',
          aqua: '#64CDDB',
          slate: '#596174',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
        brand: ['var(--font-brand)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 3s ease-in-out infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
