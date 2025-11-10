# KPI Components Usage Guide

## Overview

The KPI components provide a reusable way to display key performance indicators with icons, values, and comparison metrics.

## Components

### KpiSummary
Container component for KPI cards with a title and optional action button.

### KpiCard
Individual KPI card showing an icon, label, value, and optional change metric.

## Basic Usage

```tsx
import { KpiSummary } from '@/components/ui/KpiSummary';
import { KpiCard } from '@/components/ui/KpiCard';

export function Dashboard() {
  return (
    <KpiSummary title="KPI Summary">
      <KpiCard
        icon={
          <svg className="h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5z" />
            <path d="M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
          </svg>
        }
        iconBgColor="bg-rose-200"
        label="Total marketing spend"
        value="$192,817"
        change="+5.3%"
        isPositive={true}
      />

      <KpiCard
        icon={
          <svg className="h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
            <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
            <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
            <path d="M12 17v1m0 -8v1" />
          </svg>
        }
        iconBgColor="bg-sky-200"
        label="ROI"
        value="270%"
        change="+8.1%"
        isPositive={true}
      />
    </KpiSummary>
  );
}
```

## Using Emojis as Icons

```tsx
<KpiCard
  icon="📚"
  iconBgColor="bg-piku-purple-light"
  label="Words Learned"
  value={1250}
  change="+12.5%"
  comparisonText="vs last week"
/>
```

## With Header Action

```tsx
<KpiSummary
  title="Monthly Performance"
  action={
    <button className="text-sm text-piku-purple-dark hover:underline">
      View Details →
    </button>
  }
>
  {/* KpiCard components */}
</KpiSummary>
```

## Negative Change Example

```tsx
<KpiCard
  icon="📉"
  iconBgColor="bg-red-200"
  label="Bounce Rate"
  value="3.2%"
  change="-0.8%"
  isPositive={false}  // Shows red color
  comparisonText="vs last month"
/>
```

## Grid Layout

The KpiSummary component automatically handles responsive grid layout:
- **Mobile**: 1 column
- **md** (768px+): 2 columns
- **xl** (1280px+): 4 columns

## Props Reference

### KpiSummary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'KPI Summary'` | Title displayed in the header |
| `children` | `ReactNode` | - | KpiCard components to display |
| `action` | `ReactNode` | - | Optional action button/element in header |

### KpiCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | Icon element (SVG or emoji) |
| `iconBgColor` | `string` | `'bg-gray-200'` | Tailwind background color class |
| `label` | `string` | - | Label text above the value |
| `value` | `string \| number` | - | Main value to display |
| `change` | `string` | - | Change percentage (e.g., '+5.3%') |
| `comparisonText` | `string` | `'vs last month'` | Comparison text next to change |
| `isPositive` | `boolean` | `true` | Whether change is positive (green) or negative (red) |

## Styling

### Available Icon Background Colors

```tsx
// Piku Colors
iconBgColor="bg-piku-purple-light"
iconBgColor="bg-piku-mint"
iconBgColor="bg-piku-yellow-light"
iconBgColor="bg-piku-cyan"

// Pastel Colors
iconBgColor="bg-pastel-ocean"
iconBgColor="bg-pastel-coral"
iconBgColor="bg-pastel-blossom"

// Standard Tailwind
iconBgColor="bg-rose-200"
iconBgColor="bg-sky-200"
iconBgColor="bg-emerald-200"
iconBgColor="bg-purple-200"
```

## Complete Example (Student Dashboard)

```tsx
import { KpiSummary } from '@/components/ui/KpiSummary';
import { KpiCard } from '@/components/ui/KpiCard';

export function StudentDashboardKpis() {
  return (
    <KpiSummary title="Your Learning Progress">
      <KpiCard
        icon="📚"
        iconBgColor="bg-piku-purple-light"
        label="Words Learned"
        value={1250}
        change="+12.5%"
        comparisonText="vs last week"
      />

      <KpiCard
        icon="✨"
        iconBgColor="bg-piku-mint"
        label="Words Mastered"
        value={890}
        change="+8.3%"
        comparisonText="vs last week"
      />

      <KpiCard
        icon="🔥"
        iconBgColor="bg-piku-yellow-light"
        label="Current Streak"
        value="15 days"
        change="+3 days"
        comparisonText="this month"
      />

      <KpiCard
        icon="🎯"
        iconBgColor="bg-piku-cyan"
        label="Accuracy Rate"
        value="87%"
        change="+2.1%"
        comparisonText="vs last week"
      />
    </KpiSummary>
  );
}
```

## Notes

- The component uses Tailwind CSS classes for styling
- Icons can be SVG elements, emoji strings, or any React node
- The grid automatically adjusts borders for proper visual separation
- Last card in a row has no right border
- Bottom borders are hidden on medium screens and above
