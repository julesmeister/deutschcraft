# Piku Template - Exact Color Palette

This document contains the ACTUAL colors extracted from **"Piku - Creative Saas & Software HTML5 Template.html"**

All colors are now available in Tailwind CSS with the `piku-` prefix.

---

## Primary Card Background Colors

These are used for large feature blocks and cards in the Piku template:

| Color Name | Hex Code | Tailwind Class | Usage in Piku Template |
|------------|----------|----------------|------------------------|
| **Yellow Light** | `#FFEB80` | `bg-piku-yellow-light` | "Track Project" feature card |
| **Mint** | `#76FFCE` | `bg-piku-mint` | "Plan Project" feature card |
| **Purple Light** | `#D3A7FF` | `bg-piku-purple-light` | "Team Collaboration" card |

---

## Integration Logo Box Colors

These vibrant colors rotate through the integration/partner logo section:

| Color Name | Hex Code | Tailwind Class |
|------------|----------|----------------|
| **Purple Dark** | `#9F54FF` | `bg-piku-purple-dark` |
| **Cyan** | `#31D9EC` | `bg-piku-cyan` |
| **Magenta** | `#FE65E5` | `bg-piku-magenta` |
| **Green** | `#4EE265` | `bg-piku-green` |
| **Yellow Gold** | `#F5DC00` | `bg-piku-yellow-gold` |
| **Orange** | `#FF7F54` | `bg-piku-orange` |
| **Blue** | `#24CAFF` | `bg-piku-blue` |
| **Lime** | `#91C400` | `bg-piku-lime` |

---

## Accent Colors (Borders & Icons)

Used for pricing card borders, stat icons, and highlights:

| Color Name | Hex Code | Tailwind Class | Usage in Piku |
|------------|----------|----------------|---------------|
| **Teal** | `#20E8C4` | `border-piku-teal` | Pricing card 1 border (Personal) |
| **Gold** | `#FFD542` | `border-piku-gold` | Stats icon color, accents |
| **Pink** | `#EF62E9` | `border-piku-pink` | Stats icon color |
| **Orange Accent** | `#FFC736` | `border-piku-orange-accent` | Pricing card 2 border (Team) |
| **Pink Hot** | `#FF56BB` | `border-piku-pink-hot` | Pricing card 3 border (Enterprise) |
| **Cyan Accent** | `#00DBE4` | `border-piku-cyan-accent` | Stats icon (60x faster) |

---

## Testimonial/Feedback Card Colors

Used in the testimonial section background cards:

| Color Name | Hex Code | Tailwind Class |
|------------|----------|----------------|
| **Yellow** | `#FFDA7C` | `bg-feedback-yellow` |
| **Pink** | `#FF90ED` | `bg-feedback-pink` |
| **Cyan** | `#85F8F1` | `bg-feedback-cyan` |

---

## Theme Colors

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Dark** | `#0D1A1C` | `bg-piku-dark` or `text-piku-dark` | Primary dark background (from `<meta theme-color>`) |

---

## Color Pairing Examples from Piku Template

### Feature Cards
```tsx
// Yellow card (like "Track Project")
<div className="bg-piku-yellow-light text-gray-900">
  <h3>Track Project</h3>
  <button className="bg-piku-gold">CTA Button</button>
</div>

// Mint card (like "Plan Project")
<div className="bg-piku-mint text-gray-900">
  <h3>Plan Project</h3>
</div>

// Purple card (like "Team Collaboration")
<div className="bg-piku-purple-light text-gray-900">
  <h3>Team Collaboration</h3>
</div>
```

### Pricing Cards
```tsx
// Personal Plan
<div className="border-4 border-piku-teal bg-white">
  <h3>Personal</h3>
  <span className="text-piku-teal">$7</span>
</div>

// Team Plan
<div className="border-4 border-piku-orange-accent bg-white">
  <h3>Team</h3>
</div>

// Enterprise Plan
<div className="border-4 border-piku-pink-hot bg-white">
  <h3>Enterprise</h3>
</div>
```

### Hero Stats Icons
```tsx
// Stat 1: 60x Faster
<div className="border-2 border-piku-cyan-accent">
  <Icon className="text-piku-cyan-accent" />
</div>

// Stat 2: 70% Boost
<div className="border-2 border-piku-gold">
  <Icon className="text-piku-gold" />
</div>

// Stat 3: 10K+ Users
<div className="border-2 border-piku-pink">
  <Icon className="text-piku-pink" />
</div>
```

### Testimonials
```tsx
<div className="bg-feedback-yellow text-gray-900">
  <p>"Best app ever!"</p>
  <div className="text-yellow-500">★★★★★</div>
</div>
```

---

## Gradients Used in Piku

### Hero Section Background
```tsx
<div className="bg-gradient-to-br from-piku-purple-dark via-piku-purple-light to-piku-magenta">
  {/* Hero content */}
</div>
```

### Button Gradients
```tsx
// Mint to Green (answer buttons)
<button className="bg-gradient-to-r from-piku-mint to-piku-green">
  Correct Answer
</button>

// Yellow to Gold (progress bars)
<div className="bg-gradient-to-r from-piku-yellow-light to-piku-gold" />
```

---

## Design System Integration

All these colors are available in:
- **Tailwind Config**: `tailwind.config.ts`
- **Design System**: `lib/design-system.ts`
- **Color Pairings**: `lib/design-system.ts` → `colorPairings` object

---

## Color Categories Summary

| Category | Count | Purpose |
|----------|-------|---------|
| Card Backgrounds | 3 | Large feature blocks |
| Integration Logos | 8 | Rotating colorful boxes |
| Accent/Border | 6 | Highlights, borders, icons |
| Feedback Cards | 3 | Testimonial backgrounds |
| Theme | 1 | Primary dark theme |

**Total**: 21 unique Piku colors

---

## Quick Reference Chart

### Warm Colors
- 🟡 `#FFEB80` - Yellow Light
- 🟡 `#F5DC00` - Yellow Gold
- 🟠 `#FFD542` - Gold
- 🟠 `#FFC736` - Orange Accent
- 🟠 `#FF7F54` - Orange

### Cool Colors
- 🟢 `#76FFCE` - Mint
- 🟢 `#4EE265` - Green
- 🟢 `#91C400` - Lime
- 🔵 `#31D9EC` - Cyan
- 🔵 `#24CAFF` - Blue
- 🔵 `#00DBE4` - Cyan Accent
- 🔵 `#20E8C4` - Teal
- 🔵 `#85F8F1` - Feedback Cyan

### Purple/Pink
- 🟣 `#D3A7FF` - Purple Light
- 🟣 `#9F54FF` - Purple Dark
- 🩷 `#FE65E5` - Magenta
- 🩷 `#EF62E9` - Pink
- 🩷 `#FF56BB` - Pink Hot
- 🩷 `#FF90ED` - Feedback Pink
- 🩷 `#FFDA7C` - Feedback Yellow

### Neutral
- ⬛ `#0D1A1C` - Piku Dark

---

**Last Updated**: 2025-11-08
**Source**: Extracted from `Piku - Creative Saas & Software HTML5 Template.html`
