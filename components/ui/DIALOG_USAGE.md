# Dialog Component Usage Guide

Reusable, accessible dialog/modal component with multiple variants.

## Components

### `<Dialog />` - Base Component
Fully customizable dialog with title, content, and footer.

### `<ConfirmDialog />` - Confirmation Dialog
Quick confirm/cancel dialog for destructive or important actions.

### `<AlertDialog />` - Alert Dialog
Simple alert with a single "Okay" button.

### `<DialogFooter />` - Footer Helper
Styled footer container for action buttons.

### `<DialogButton />` - Button Helper
Pre-styled button with variants (primary, secondary, danger).

---

## Basic Usage

### 1. Custom Dialog

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogFooter, DialogButton } from '@/components/ui/Dialog';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Dialog Title"
        footer={
          <DialogFooter>
            <DialogButton variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </DialogButton>
            <DialogButton variant="primary" onClick={() => console.log('Confirmed')}>
              Okay
            </DialogButton>
          </DialogFooter>
        }
      >
        <p>
          There are many variations of passages of Lorem Ipsum available, but the majority have
          suffered alteration in some form.
        </p>
      </Dialog>
    </>
  );
}
```

### 2. Confirm Dialog (Quick Pattern)

```tsx
'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/Dialog';

export function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log('Deleted!');
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete Item</button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
```

### 3. Alert Dialog (Simple Notification)

```tsx
'use client';

import { useState } from 'react';
import { AlertDialog } from '@/components/ui/Dialog';

export function SuccessMessage() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <>
      <button onClick={() => setShowAlert(true)}>Show Success</button>

      <AlertDialog
        open={showAlert}
        onClose={() => setShowAlert(false)}
        title="Success!"
        message="Your changes have been saved successfully."
        buttonText="Got it"
      />
    </>
  );
}
```

---

## Props Reference

### Dialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls dialog visibility |
| `onClose` | `() => void` | - | Callback when dialog closes |
| `title` | `string?` | - | Dialog title (optional) |
| `children` | `ReactNode` | - | Dialog content |
| `footer` | `ReactNode?` | - | Footer content (buttons, etc.) |
| `showCloseButton` | `boolean` | `true` | Show X button in top-right |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Dialog width |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close with ESC key |
| `className` | `string?` | - | Additional CSS classes |

### ConfirmDialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls dialog visibility |
| `onClose` | `() => void` | - | Callback when dialog closes |
| `onConfirm` | `() => void` | - | Callback when user confirms |
| `title` | `string` | `'Confirm Action'` | Dialog title |
| `message` | `string` | - | Confirmation message |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `variant` | `'primary' \| 'danger'` | `'primary'` | Button style |
| `isLoading` | `boolean` | `false` | Show loading state |

### AlertDialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls dialog visibility |
| `onClose` | `() => void` | - | Callback when dialog closes |
| `title` | `string` | `'Alert'` | Dialog title |
| `message` | `string` | - | Alert message |
| `buttonText` | `string` | `'Okay'` | Button text |

### DialogButton Variants

- **`primary`**: Blue background, white text (for main actions)
- **`secondary`**: White background, bordered (for cancel/alternative actions)
- **`danger`**: Red background, white text (for destructive actions)

---

## Advanced Examples

### Form in Dialog

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogFooter, DialogButton } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

export function CreateStudentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating student:', { name, email });
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Student</button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Student"
        size="lg"
        footer={
          <DialogFooter>
            <DialogButton variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </DialogButton>
            <DialogButton variant="primary" type="submit" form="student-form">
              Create Student
            </DialogButton>
          </DialogFooter>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}
```

### Loading State

```tsx
'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/Dialog';

export function DeleteWithLoading() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await fetch('/api/delete-item', { method: 'DELETE' });

    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### Different Sizes

```tsx
// Small dialog
<Dialog open={true} onClose={() => {}} size="sm" title="Small">
  <p>Compact content</p>
</Dialog>

// Medium dialog (default)
<Dialog open={true} onClose={() => {}} size="md" title="Medium">
  <p>Standard content</p>
</Dialog>

// Large dialog
<Dialog open={true} onClose={() => {}} size="lg" title="Large">
  <p>Lots of content</p>
</Dialog>

// Extra large dialog
<Dialog open={true} onClose={() => {}} size="xl" title="Extra Large">
  <p>Even more content</p>
</Dialog>
```

### No Close Button

```tsx
<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Important Message"
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
>
  <p>You must choose an option to continue.</p>
</Dialog>
```

---

## Accessibility Features

✅ **Keyboard Support**
- ESC key to close (configurable)
- Focus trap (Tab cycles within dialog)
- Focus restoration when closed

✅ **Screen Reader Support**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` for title

✅ **Visual Indicators**
- Backdrop overlay
- Smooth animations
- Clear button states

---

## Use Cases in Testmanship

### 1. Delete Student Confirmation
```tsx
<ConfirmDialog
  open={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={deleteStudent}
  title="Remove Student"
  message="Are you sure you want to remove this student from your class?"
  variant="danger"
/>
```

### 2. Level Up Celebration
```tsx
<AlertDialog
  open={showLevelUp}
  onClose={() => setShowLevelUp(false)}
  title="🎉 Congratulations!"
  message="You've advanced to level B1! Keep up the great work!"
/>
```

### 3. Assignment Details
```tsx
<Dialog
  open={showDetails}
  onClose={() => setShowDetails(false)}
  title="Assignment: German Articles"
  size="lg"
>
  <div className="space-y-4">
    <p><strong>Due:</strong> Tomorrow, 5:00 PM</p>
    <p><strong>Words:</strong> 20</p>
    <p><strong>Level:</strong> A2</p>
  </div>
</Dialog>
```

### 4. Create Flashcard Set
```tsx
<Dialog
  open={showCreate}
  onClose={() => setShowCreate(false)}
  title="Create Flashcard Set"
  footer={
    <DialogFooter>
      <DialogButton variant="secondary" onClick={() => setShowCreate(false)}>
        Cancel
      </DialogButton>
      <DialogButton variant="primary" onClick={handleCreate}>
        Create
      </DialogButton>
    </DialogFooter>
  }
>
  {/* Form fields for creating flashcard set */}
</Dialog>
```

---

## Styling

All dialogs use the project's design system:
- **Primary Blue**: `#3B82F6`
- **Danger Red**: `#EF4444`
- **Neutral Scale**: For text and borders
- **Rounded corners**: `rounded-2xl`
- **Shadow**: `shadow-2xl`

---

## Best Practices

✅ **DO:**
- Use ConfirmDialog for destructive actions
- Use AlertDialog for simple notifications
- Keep dialog content concise
- Use appropriate button variants
- Provide clear action labels

❌ **DON'T:**
- Nest dialogs inside dialogs
- Put critical navigation in dialogs
- Use for complex multi-step workflows (use pages instead)
- Forget to handle loading states for async actions
