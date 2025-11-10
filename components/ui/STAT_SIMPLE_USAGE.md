# StatGridSimple & StatCardSimple Usage Guide

## Overview

Simpler, more colorful alternative to StatGrid/StatCard with full-color card backgrounds and dark icon badges.

## Components

### StatGridSimple
Container with optional title and action button. No outer border.

### StatCardSimple
Colorful card with large value, label, and dark circular icon badge.

## Basic Usage

```tsx
import { StatGridSimple } from '@/components/ui/StatGridSimple';
import { StatCardSimple } from '@/components/ui/StatCardSimple';

export function Dashboard() {
  return (
    <StatGridSimple title="Overview">
      <StatCardSimple
        label="Ongoing project"
        value={12}
        icon={
          <svg className="h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
            <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
          </svg>
        }
        bgColor="bg-sky-100"
      />

      <StatCardSimple
        label="Project completed"
        value={68}
        icon={
          <svg className="h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M11 14l2 2l4 -4" />
          </svg>
        }
        bgColor="bg-emerald-100"
      />

      <StatCardSimple
        label="Upcoming project"
        value={7}
        icon={
          <svg className="h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 3v12" />
            <path d="M16 11l-4 4l-4 -4" />
          </svg>
        }
        bgColor="bg-purple-100"
      />
    </StatGridSimple>
  );
}
```

## With Emoji Icons

```tsx
<StatGridSimple title="Student Progress">
  <StatCardSimple
    label="Words Learned"
    value={1250}
    icon="📚"
    bgColor="bg-violet-100"
  />

  <StatCardSimple
    label="Current Streak"
    value="15 days"
    icon="🔥"
    bgColor="bg-orange-100"
  />

  <StatCardSimple
    label="Accuracy"
    value="87%"
    icon="🎯"
    bgColor="bg-emerald-100"
  />
</StatGridSimple>
```

## With Header Action

```tsx
<StatGridSimple
  title="Overview"
  action={
    <a href="/projects">
      <div className="whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:[scale:0.98] h-10 rounded-xl border-solid border border-neutral-300 bg-white px-3 py-2 text-sm leading-snug text-neutral-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-sm">
        All projects
      </div>
    </a>
  }
>
  {/* StatCardSimple components */}
</StatGridSimple>
```

## Custom Column Count

```tsx
// 2 columns
<StatGridSimple columns={2}>
  <StatCardSimple label="Total" value={100} icon="📊" bgColor="bg-blue-100" />
  <StatCardSimple label="Active" value={75} icon="✅" bgColor="bg-green-100" />
</StatGridSimple>

// 4 columns
<StatGridSimple columns={4}>
  {/* 4 cards */}
</StatGridSimple>
```

## Custom Icon Colors

```tsx
<StatCardSimple
  label="Custom Icon"
  value={42}
  icon="🎨"
  bgColor="bg-pink-100"
  iconBgColor="bg-pink-600"
  iconTextColor="text-white"
/>
```

## Props Reference

### StatGridSimple Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Optional section title |
| `children` | `ReactNode` | - | StatCardSimple components |
| `action` | `ReactNode` | - | Optional header action button |
| `columns` | `2 \| 3 \| 4` | `3` | Number of columns on desktop |

### StatCardSimple Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above value |
| `value` | `string \| number` | - | Main value (large) |
| `icon` | `ReactNode` | - | Icon (SVG or emoji) |
| `bgColor` | `string` | `'bg-gray-100'` | Card background color |
| `iconBgColor` | `string` | `'bg-neutral-900'` | Icon badge background |
| `iconTextColor` | `string` | `'text-white'` | Icon badge text color |

## Color Examples

### Tailwind Background Colors

```tsx
// Cool colors
bgColor="bg-sky-100"
bgColor="bg-blue-100"
bgColor="bg-cyan-100"
bgColor="bg-teal-100"

// Warm colors
bgColor="bg-orange-100"
bgColor="bg-amber-100"
bgColor="bg-yellow-100"
bgColor="bg-rose-100"

// Nature colors
bgColor="bg-emerald-100"
bgColor="bg-green-100"
bgColor="bg-lime-100"

// Purple/Pink
bgColor="bg-purple-100"
bgColor="bg-violet-100"
bgColor="bg-fuchsia-100"
bgColor="bg-pink-100"
```

### Your Brand Colors

```tsx
bgColor="bg-piku-purple-light"
bgColor="bg-piku-mint"
bgColor="bg-piku-yellow-light"
bgColor="bg-pastel-ocean"
bgColor="bg-pastel-coral"
bgColor="bg-pastel-blossom"
```

## Comparison: StatCard vs StatCardSimple

### StatCard (Original)
- White background with border
- Smaller icon with custom color background
- Shows change percentage
- More detailed/professional look

### StatCardSimple (New)
- Colorful full card background
- Large value (4xl)
- Dark icon badge (circular)
- Simpler, more playful look

## Complete Example

```tsx
import { StatGridSimple } from '@/components/ui/StatGridSimple';
import { StatCardSimple } from '@/components/ui/StatCardSimple';

export function ProjectOverview() {
  return (
    <StatGridSimple
      title="Overview"
      action={
        <a href="/projects/all">
          <button className="px-3 py-2 border border-neutral-300 rounded-xl hover:border-blue-500 hover:text-blue-500 transition">
            All projects
          </button>
        </a>
      }
    >
      <StatCardSimple
        label="Ongoing project"
        value={12}
        icon="⚡"
        bgColor="bg-sky-100"
      />

      <StatCardSimple
        label="Project completed"
        value={68}
        icon="✅"
        bgColor="bg-emerald-100"
      />

      <StatCardSimple
        label="Upcoming project"
        value={7}
        icon="📥"
        bgColor="bg-purple-100"
      />
    </StatGridSimple>
  );
}
```

## Layout

- **Mobile**: 1 column (stacked)
- **Tablet/Desktop**: 2, 3, or 4 columns (configurable)
- No outer container border (cards have colored backgrounds)
- Clean spacing with gap-4
