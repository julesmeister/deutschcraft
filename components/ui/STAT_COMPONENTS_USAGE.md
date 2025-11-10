# Stat Components Usage Guide

## Overview

Generic, reusable components for displaying statistics, metrics, or any grouped information with icons, values, and optional comparison data.

## Components

### StatGrid
Container component for stat cards with optional title and action button.

### StatCard
Individual stat card showing an icon, label, value, and optional change metric.

## Basic Usage

```tsx
import { StatGrid } from '@/components/ui/StatGrid';
import { StatCard } from '@/components/ui/StatCard';

export function Dashboard() {
  return (
    <StatGrid title="Overview">
      <StatCard
        icon="📚"
        iconBgColor="bg-rose-200"
        label="Total Users"
        value="1,289"
        change="+16.2%"
      />

      <StatCard
        icon="💰"
        iconBgColor="bg-sky-200"
        label="Revenue"
        value="$192,817"
        change="+5.3%"
      />
    </StatGrid>
  );
}
```

## Without Title

```tsx
<StatGrid>
  <StatCard icon="📚" label="Words Learned" value={1250} />
  <StatCard icon="✨" label="Words Mastered" value={890} />
</StatGrid>
```

## Props Reference

### StatGrid Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Optional title |
| `children` | `ReactNode` | StatCard components |
| `action` | `ReactNode` | Optional action button |

### StatCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | Icon (SVG or emoji) |
| `iconBgColor` | `string` | `'bg-gray-200'` | Background color |
| `label` | `string` | - | Label text |
| `value` | `string \| number` | - | Main value |
| `change` | `string` | - | Change (e.g., '+5.3%') |
| `comparisonText` | `string` | `'vs last month'` | Comparison text |
| `isPositive` | `boolean` | `true` | Green (true) or red (false) |

## Grid Layout

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (xl): 4 columns
