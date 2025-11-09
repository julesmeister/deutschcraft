# Menu/Dropdown Components

Reusable menu and dropdown components with collapsible sections, perfect for navigation menus, context menus, and settings panels.

## Components

### `<Menu />` - Container
Wrapper component for menu items and sections.

### `<MenuItem />` - Menu Item
Individual clickable menu item with optional icon.

### `<MenuSection />` - Collapsible Section
Expandable/collapsible menu section with nested items.

---

## Basic Usage

### Simple Menu

```tsx
import { Menu, MenuItem } from '@/components/ui/dropdown';
import { Settings, MessageCircle, Globe } from 'lucide-react';

export function SimpleMenu() {
  return (
    <Menu>
      <MenuItem icon={Settings} onClick={() => console.log('Settings')}>
        Settings
      </MenuItem>
      <MenuItem icon={MessageCircle} onClick={() => console.log('Messages')}>
        Messages
      </MenuItem>
      <MenuItem icon={Globe} onClick={() => console.log('Network')}>
        Network
      </MenuItem>
    </Menu>
  );
}
```

### Menu with Collapsible Section

```tsx
import { Menu, MenuItem, MenuSection } from '@/components/ui/dropdown';
import { Settings, MessageCircle, Globe, Wifi, LifeBuoy } from 'lucide-react';

export function MenuWithSection() {
  return (
    <Menu>
      <MenuItem icon={Settings} onClick={() => console.log('Settings')}>
        Settings
      </MenuItem>
      <MenuItem icon={MessageCircle} onClick={() => console.log('Messages')}>
        Messages
      </MenuItem>

      <MenuSection icon={Globe} title="Network" defaultOpen={true}>
        <MenuItem icon={Wifi} onClick={() => console.log('Wifi')}>
          Wifi
        </MenuItem>
        <MenuItem icon={LifeBuoy} onClick={() => console.log('Support')}>
          Support
        </MenuItem>
      </MenuSection>
    </Menu>
  );
}
```

---

## Component Props

### Menu Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Menu items and sections |
| `className` | `string?` | - | Additional CSS classes |

### MenuItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon \| ReactNode?` | - | Icon component or element |
| `children` | `ReactNode` | - | Menu item label |
| `onClick` | `() => void?` | - | Click handler |
| `active` | `boolean` | `false` | Highlighted state |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string?` | - | Additional CSS classes |

### MenuSection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon \| ReactNode?` | - | Icon component or element |
| `title` | `string` | - | Section title |
| `children` | `ReactNode` | - | Nested menu items |
| `defaultOpen` | `boolean` | `false` | Initially expanded |
| `className` | `string?` | - | Additional CSS classes |

---

## Advanced Examples

### Student Dashboard Menu

```tsx
import { Menu, MenuItem, MenuSection } from '@/components/ui/dropdown';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  User,
  Bell,
  HelpCircle
} from 'lucide-react';

export function StudentMenu() {
  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path);
  };

  return (
    <Menu>
      <MenuItem
        icon={LayoutDashboard}
        onClick={() => handleNavigation('/dashboard')}
        active={true}
      >
        Dashboard
      </MenuItem>

      <MenuItem
        icon={BookOpen}
        onClick={() => handleNavigation('/practice')}
      >
        Practice
      </MenuItem>

      <MenuItem
        icon={Trophy}
        onClick={() => handleNavigation('/achievements')}
      >
        Achievements
      </MenuItem>

      <MenuItem
        icon={BarChart3}
        onClick={() => handleNavigation('/progress')}
      >
        Progress
      </MenuItem>

      <MenuSection icon={Settings} title="Settings">
        <MenuItem
          icon={User}
          onClick={() => handleNavigation('/settings/profile')}
        >
          Profile
        </MenuItem>
        <MenuItem
          icon={Bell}
          onClick={() => handleNavigation('/settings/notifications')}
        >
          Notifications
        </MenuItem>
      </MenuSection>

      <MenuItem
        icon={HelpCircle}
        onClick={() => handleNavigation('/help')}
      >
        Help & Support
      </MenuItem>
    </Menu>
  );
}
```

### Teacher Controls Menu

```tsx
import { Menu, MenuItem, MenuSection } from '@/components/ui/dropdown';
import {
  Users,
  FileText,
  Calendar,
  Settings,
  Download,
  Upload,
  Archive
} from 'lucide-react';

export function TeacherMenu() {
  return (
    <Menu>
      <MenuItem icon={Users}>
        Students
      </MenuItem>

      <MenuItem icon={FileText}>
        Assignments
      </MenuItem>

      <MenuItem icon={Calendar}>
        Schedule
      </MenuItem>

      <MenuSection icon={Archive} title="Import/Export" defaultOpen={false}>
        <MenuItem icon={Upload}>
          Import Data
        </MenuItem>
        <MenuItem icon={Download}>
          Export Report
        </MenuItem>
      </MenuSection>

      <MenuItem icon={Settings}>
        Settings
      </MenuItem>
    </Menu>
  );
}
```

### Context Menu (Right-click)

```tsx
'use client';

import { useState } from 'react';
import { Menu, MenuItem } from '@/components/ui/dropdown';
import { Edit, Trash2, Copy, Share2 } from 'lucide-react';

export function ContextMenu() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="p-8 bg-neutral-100 rounded-lg"
      >
        Right-click me!
      </div>

      {isVisible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsVisible(false)}
          />
          <div
            className="fixed z-50"
            style={{ left: position.x, top: position.y }}
          >
            <Menu>
              <MenuItem icon={Edit} onClick={() => console.log('Edit')}>
                Edit
              </MenuItem>
              <MenuItem icon={Copy} onClick={() => console.log('Copy')}>
                Copy
              </MenuItem>
              <MenuItem icon={Share2} onClick={() => console.log('Share')}>
                Share
              </MenuItem>
              <MenuItem
                icon={Trash2}
                onClick={() => console.log('Delete')}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </MenuItem>
            </Menu>
          </div>
        </>
      )}
    </>
  );
}
```

### Active State & Routing

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { Menu, MenuItem } from '@/components/ui/dropdown';
import { Home, BookOpen, Trophy } from 'lucide-react';

export function NavMenu() {
  const pathname = usePathname();

  return (
    <Menu>
      <MenuItem
        icon={Home}
        active={pathname === '/dashboard'}
      >
        Dashboard
      </MenuItem>
      <MenuItem
        icon={BookOpen}
        active={pathname === '/practice'}
      >
        Practice
      </MenuItem>
      <MenuItem
        icon={Trophy}
        active={pathname === '/achievements'}
      >
        Achievements
      </MenuItem>
    </Menu>
  );
}
```

### Disabled Items

```tsx
import { Menu, MenuItem } from '@/components/ui/dropdown';
import { Lock, CheckCircle } from 'lucide-react';

export function MenuWithDisabled() {
  return (
    <Menu>
      <MenuItem icon={CheckCircle}>
        Available Feature
      </MenuItem>
      <MenuItem icon={Lock} disabled>
        Premium Feature
      </MenuItem>
    </Menu>
  );
}
```

### Custom Icons (SVG)

```tsx
import { Menu, MenuItem } from '@/components/ui/dropdown';

export function MenuWithCustomIcons() {
  const customIcon = (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  return (
    <Menu>
      <MenuItem icon={customIcon}>
        Custom Icon Item
      </MenuItem>
    </Menu>
  );
}
```

### Multiple Sections

```tsx
import { Menu, MenuItem, MenuSection } from '@/components/ui/dropdown';
import {
  Settings,
  User,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  LogOut
} from 'lucide-react';

export function SettingsMenu() {
  return (
    <Menu>
      <MenuSection icon={User} title="Account">
        <MenuItem icon={User}>Profile</MenuItem>
        <MenuItem icon={Lock}>Security</MenuItem>
        <MenuItem icon={Bell}>Notifications</MenuItem>
      </MenuSection>

      <MenuSection icon={Settings} title="Preferences">
        <MenuItem icon={Settings}>General</MenuItem>
        <MenuItem icon={FileText}>Data & Privacy</MenuItem>
      </MenuSection>

      <MenuItem icon={HelpCircle}>Help Center</MenuItem>
      <MenuItem
        icon={LogOut}
        className="text-red-600 hover:text-red-700"
      >
        Sign Out
      </MenuItem>
    </Menu>
  );
}
```

---

## Styling

All components use the project's design system:
- **Text**: Neutral-600 (default), Neutral-900 (hover/active)
- **Background**: Neutral-100 (hover/active)
- **Border**: Neutral-200
- **Rounded corners**: `rounded-lg` for items, `rounded-md` for container
- **Transitions**: Smooth 150-300ms animations

---

## Accessibility Features

✅ **Keyboard Support**
- Arrow keys for navigation (future enhancement)
- Enter/Space to activate items

✅ **Screen Reader Support**
- `role="menuitem"` on items
- `role="button"` on section headers
- `aria-expanded` on collapsible sections
- `aria-disabled` on disabled items

✅ **Visual Indicators**
- Hover states
- Active states
- Disabled states
- Smooth expand/collapse animations

---

## Use Cases in Testmanship

### 1. Sidebar Navigation
```tsx
<Menu>
  <MenuItem icon={LayoutDashboard}>Dashboard</MenuItem>
  <MenuItem icon={BookOpen}>Practice</MenuItem>
  <MenuItem icon={Trophy}>Achievements</MenuItem>
  <MenuSection icon={Settings} title="Settings">
    <MenuItem icon={User}>Profile</MenuItem>
    <MenuItem icon={Bell}>Notifications</MenuItem>
  </MenuSection>
</Menu>
```

### 2. User Profile Dropdown
```tsx
<Menu>
  <MenuItem icon={User}>My Profile</MenuItem>
  <MenuItem icon={Settings}>Settings</MenuItem>
  <MenuItem icon={HelpCircle}>Help</MenuItem>
  <MenuItem icon={LogOut}>Sign Out</MenuItem>
</Menu>
```

### 3. Filter Menu
```tsx
<MenuSection icon={Filter} title="Filters" defaultOpen={true}>
  <MenuItem>All Levels</MenuItem>
  <MenuItem>A1 - Beginner</MenuItem>
  <MenuItem>A2 - Elementary</MenuItem>
  <MenuItem>B1 - Intermediate</MenuItem>
</MenuSection>
```

### 4. Quick Actions Menu
```tsx
<Menu>
  <MenuItem icon={Plus}>New Flashcard Set</MenuItem>
  <MenuItem icon={Upload}>Import Words</MenuItem>
  <MenuItem icon={Download}>Export Progress</MenuItem>
</Menu>
```

---

## Best Practices

✅ **DO:**
- Use clear, concise labels
- Group related items in sections
- Use meaningful icons
- Keep menu depth shallow (max 2 levels)

❌ **DON'T:**
- Nest sections inside sections
- Use too many items (>10 without sections)
- Mix icons and non-icons in same menu
- Create deep hierarchies (use breadcrumbs instead)

---

## Animation Details

- **Section expand/collapse**: 300ms ease-in-out
- **Hover state**: 150ms ease-in-out
- **Chevron rotation**: 200ms smooth rotation
