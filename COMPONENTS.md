# Reusable UI Components

This document describes all reusable UI components available for building the Testmanship dashboard and pages.

## Components

### 1. Card Component

Flexible card component with various options for styling.

**Location:** `components/ui/Card.tsx`

**Usage:**

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

// Basic card
<Card>
  <CardTitle>Card Title</CardTitle>
  <CardContent>Card content goes here</CardContent>
</Card>

// Card with all features
<Card
  padding="lg"
  rounded="2xl"
  shadow="lg"
  hover={true}
  backdrop={true}
>
  <CardHeader>
    <CardTitle size="xl">Featured Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This card has backdrop blur and hover effect</p>
  </CardContent>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>

// Card with gradient
<Card gradient="bg-gradient-to-br from-piku-yellow-light to-piku-gold">
  <CardTitle>Gradient Card</CardTitle>
</Card>
```

**Props:**

- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' (default: '2xl')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl' (default: 'none')
- `hover`: boolean - adds scale and shadow on hover (default: false)
- `backdrop`: boolean - adds backdrop blur effect (default: false)
- `gradient`: string - custom gradient class

**Sub-components:**

- `CardHeader` - Header section with bottom margin
- `CardTitle` - Title with size options ('sm' | 'md' | 'lg' | 'xl')
- `CardContent` - Main content area
- `CardFooter` - Footer with top border

---

### 2. Button Component

Button component with multiple variants and sizes.

**Location:** `components/ui/Button.tsx`

**Usage:**

```tsx
import { Button, ThemeButton } from '@/components/ui/Button';

// Primary button
<Button variant="primary" size="md">
  Click Me
</Button>

// Button with icon
<Button
  variant="gradient"
  withIcon={true}
  icon={<ArrowRight />}
>
  Get Started
</Button>

// Link button
<Button href="/dashboard" variant="primary">
  Go to Dashboard
</Button>

// Theme button (like navbar)
<ThemeButton variant="dark">
  Start Learning
</ThemeButton>
```

**Props:**

**Button:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: 'md' | 'lg' | 'xl' | 'full' (default: 'lg')
- `withIcon`: boolean - shows icon after text
- `icon`: ReactNode - custom icon element
- `href`: string - renders as Link if provided

**ThemeButton:**
- `variant`: 'dark' | 'light' (default: 'dark')
- `href`: string - renders as Link if provided

**Variants:**
- `primary`: Purple background, white text
- `secondary`: Gray background, dark text
- `outline`: Purple border, transparent background
- `ghost`: Transparent with hover effect
- `gradient`: Purple to cyan gradient

---

### 3. Badge Component

Small label component for tags and status indicators.

**Location:** `components/ui/Badge.tsx`

**Usage:**

```tsx
import { Badge, HeroBadge } from '@/components/ui/Badge';

// Default badge
<Badge>New</Badge>

// Colored badges
<Badge variant="purple">Premium</Badge>
<Badge variant="green">Active</Badge>
<Badge variant="yellow">Pending</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Hero badge (for dark backgrounds)
<HeroBadge>AI-Powered Learning</HeroBadge>
```

**Props:**

- `variant`: 'default' | 'purple' | 'cyan' | 'green' | 'yellow' | 'pink' | 'outline' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'sm')
- `rounded`: 'md' | 'lg' | 'xl' | 'full' (default: 'full')

---

### 4. Container & Section Components

Layout components for consistent spacing and structure.

**Location:** `components/ui/Container.tsx`

**Usage:**

```tsx
import { Container, Section } from '@/components/ui/Container';

// Basic container
<Container>
  <h1>Page Content</h1>
</Container>

// Container with custom max width
<Container maxWidth="4xl">
  <div>Wider container</div>
</Container>

// Section with background
<Section id="features" background="gray" padding="xl">
  <Container>
    <h2>Features Section</h2>
  </Container>
</Section>

// Dark section
<Section background="dark">
  <Container>
    <p className="text-white">Dark background content</p>
  </Container>
</Section>
```

**Container Props:**

- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full' (default: 'xl')
- `padding`: boolean - adds horizontal padding (default: true)

**Section Props:**

- `id`: string - section ID for navigation
- `background`: 'white' | 'gray' | 'dark' | 'gradient' (default: 'white')
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' (default: 'lg')

---

## Dashboard Examples

### Stats Card

```tsx
<Card shadow="md" hover={true}>
  <CardContent>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-piku-purple-light flex items-center justify-center">
        <span className="text-2xl">📚</span>
      </div>
      <div>
        <p className="text-gray-600 text-sm">Words Learned</p>
        <h3 className="text-3xl font-black text-gray-900">1,247</h3>
      </div>
    </div>
  </CardContent>
</Card>
```

### Progress Card

```tsx
<Card shadow="lg">
  <CardHeader>
    <CardTitle size="md">Learning Progress</CardTitle>
    <Badge variant="green">On Track</Badge>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Level B1</span>
        <span>75%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-piku-purple-dark to-piku-cyan rounded-full w-3/4" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Action Card

```tsx
<Card backdrop={true} padding="lg">
  <CardHeader>
    <CardTitle>Start New Exercise</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-600 mb-4">
      Practice your German with AI-generated flashcards
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="gradient" size="md" className="w-full">
      Begin Practice
    </Button>
  </CardFooter>
</Card>
```

### Dashboard Grid Layout

```tsx
<Section background="gray">
  <Container maxWidth="6xl">
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats cards */}
      <Card shadow="md">
        <CardContent>Stats content</CardContent>
      </Card>

      <Card shadow="md">
        <CardContent>More stats</CardContent>
      </Card>

      <Card shadow="md">
        <CardContent>Even more stats</CardContent>
      </Card>
    </div>

    {/* Main content */}
    <div className="grid lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2">
        <Card shadow="lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Activity list */}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card shadow="lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">Action 1</Button>
            <Button variant="outline" className="w-full">Action 2</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </Container>
</Section>
```

---

## Color Palette Reference

Use these Tailwind classes for consistency:

**Purple:**
- `bg-piku-purple-dark` - Main purple
- `bg-piku-purple-light` - Light purple
- `text-piku-purple-dark`

**Cyan:**
- `bg-piku-cyan` - Main cyan
- `bg-piku-cyan-accent` - Bright cyan
- `text-piku-cyan-accent`

**Other Colors:**
- `bg-piku-yellow-light`, `bg-piku-gold`
- `bg-piku-mint`, `bg-piku-green`
- `bg-piku-pink`, `bg-piku-magenta`
- `bg-piku-orange`, `bg-piku-orange-accent`

**Gradients:**
- `bg-gradient-to-r from-piku-purple-dark to-piku-cyan`
- `bg-gradient-to-br from-piku-yellow-light to-piku-gold`
- `bg-gradient-to-br from-piku-mint to-piku-green`

**Card Backgrounds:**
- `bg-piku-mint` - Mint green (#76FFCE) - Great for testimonials/success sections
- `bg-piku-yellow-light` - Light yellow (#FFEB80) - Great for highlighted content
- `bg-piku-purple-light` - Light purple (#D3A7FF) - Great for premium features

---

## Best Practices

1. **Use Card for containers** - Consistent rounded corners and shadows
2. **Button variants** - Primary for main actions, outline for secondary
3. **Badges for status** - Color-code different states
4. **Container for layouts** - Maintains consistent max-width
5. **Section for page structure** - Easy background management
6. **Backdrop for overlays** - Use `backdrop={true}` on Cards over images
7. **Hover effects** - Add `hover={true}` to interactive cards

---

## Next Steps

When building the dashboard:

1. Import components from `@/components/ui/`
2. Use the color palette from `lib/design-system.ts`
3. Follow the grid layout examples above
4. Add custom components as needed (charts, tables, etc.)
5. Maintain consistency with the landing page design
