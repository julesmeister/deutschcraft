# DetailRow Components

Reusable components for displaying label-value pairs in a clean, minimal design inspired by modern task management UIs.

## Components

### `<DetailGrid />` - Grid Container
Two-column responsive grid for organizing detail rows.

### `<DetailRow />` - Label-Value Row
A single row with icon, label, and value content.

### `<DetailTag />` - Colored Badge
Small colored tag for displaying status, labels, and categories.

---

## Basic Usage

### Simple Detail Row

```tsx
import { DetailGrid, DetailRow, DetailTag } from '@/components/ui/DetailRow';

<DetailGrid>
  <div className="flex flex-col">
    <DetailRow
      icon={
        <svg strokeWidth="2" viewBox="0 0 24 24" className="h-5 fill-none stroke-current">
          <path d="M12 5l0 14"></path>
          <path d="M5 12l14 0"></path>
        </svg>
      }
      label="Word Count"
    >
      <span className="font-semibold">500 - 1000</span>
    </DetailRow>
  </div>
</DetailGrid>
```

### With Tags

```tsx
<DetailRow
  icon={<UserIcon />}
  label="Status"
>
  <DetailTag label="In Progress" color="sky" />
</DetailRow>
```

### Multiple Tags

```tsx
<DetailRow label="Labels">
  <div className="inline-flex gap-1 flex-wrap">
    <DetailTag label="Bug" color="amber" />
    <DetailTag label="Live issue" color="rose" />
  </div>
</DetailRow>
```

---

## API Reference

### DetailGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Grid content |
| `columns` | `1 \| 2` | `2` | Number of columns (responsive on xl) |
| `className` | `string?` | - | Additional CSS classes |

### DetailRow Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode?` | - | Icon element (SVG) |
| `label` | `string` | - | Label text |
| `children` | `ReactNode` | - | Value content |
| `className` | `string?` | - | Additional CSS classes |

### DetailTag Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Tag text |
| `color` | `'amber' \| 'rose' \| 'sky' \| 'emerald' \| 'purple' \| 'blue' \| 'neutral'` | `'neutral'` | Color variant |
| `className` | `string?` | - | Additional CSS classes |

---

## Tag Colors

- **amber** - Warnings, important items
- **rose** - Urgent, critical items
- **sky** - Info, in-progress status
- **emerald** - Success, completed items
- **purple** - Special, premium items
- **blue** - General info
- **neutral** - Default, neutral items

---

## Examples

### Task Details

```tsx
<DetailGrid>
  {/* Left Column */}
  <div className="flex flex-col">
    <DetailRow icon={<Icon />} label="Word Count">
      <span className="font-semibold">500 - 1000</span>
    </DetailRow>

    <DetailRow icon={<Icon />} label="Points">
      <span className="font-semibold">100</span>
    </DetailRow>
  </div>

  {/* Right Column */}
  <div className="flex flex-col">
    <DetailRow icon={<Icon />} label="Status">
      <DetailTag label="In Progress" color="sky" />
    </DetailRow>

    <DetailRow icon={<Icon />} label="Priority">
      <DetailTag label="High" color="rose" />
    </DetailRow>
  </div>
</DetailGrid>
```

### Minimal (No Icons)

```tsx
<DetailRow label="Due Date">
  <span className="font-semibold">March 24</span>
</DetailRow>
```

---

## Design Philosophy

- **Minimal & Clean** - No heavy cards or borders
- **Icon + Label + Value** - Clear visual hierarchy
- **Responsive** - 1 column on mobile, 2 on desktop
- **Flexible Content** - Works with text, tags, avatars, etc.
- **Consistent Spacing** - `min-w-36` for labels, `min-h-12` for values

---

## Best Practices

✅ **DO:**
- Use icons consistently across related fields
- Keep labels short (1-3 words)
- Use tags for status/categories
- Use plain text for numeric values

❌ **DON'T:**
- Mix different icon styles
- Use long label text
- Overcrowd with too many tags
- Use cards/borders inside DetailRow
