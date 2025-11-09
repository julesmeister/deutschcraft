# Toast Notification System

Reusable toast notification components for displaying temporary messages to users.

## Components

### `<ToastProvider />` - Context Provider
Wrap your app with this to enable toast notifications.

### `useToast()` - Hook
Hook to trigger toast notifications from anywhere in your app.

### `<Toast />` - Individual Toast
Individual toast component (usually not used directly).

---

## Setup

### 1. Wrap Your App with ToastProvider

```tsx
// app/layout.tsx
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

### 2. Use Toast Notifications

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Student added successfully!');
  };

  const handleError = () => {
    toast.error('Failed to save changes');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

---

## API Reference

### useToast Hook

Returns an object with these methods:

| Method | Signature | Description |
|--------|-----------|-------------|
| `success` | `(message: string, duration?: number) => void` | Show success toast (green) |
| `error` | `(message: string, duration?: number) => void` | Show error toast (red) |
| `warning` | `(message: string, duration?: number) => void` | Show warning toast (amber) |
| `info` | `(message: string, duration?: number) => void` | Show info toast (blue) |
| `addToast` | `(message: string, variant?: ToastVariant, duration?: number) => void` | Generic method |
| `removeToast` | `(id: string) => void` | Manually remove a toast |

### Toast Variants

- **`success`** - Green checkmark icon, for successful operations
- **`error`** - Red alert icon, for errors
- **`warning`** - Amber warning icon, for warnings
- **`info`** - Blue info icon, for informational messages

### Default Duration

- Default: **5000ms (5 seconds)**
- Can be customized per toast
- Set to `0` for permanent toast (must be manually closed)

---

## Usage Examples

### Basic Toasts

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function BasicExample() {
  const toast = useToast();

  return (
    <div className="space-y-2">
      <button onClick={() => toast.success('Success!')}>
        Success Toast
      </button>

      <button onClick={() => toast.error('Error occurred!')}>
        Error Toast
      </button>

      <button onClick={() => toast.warning('Be careful!')}>
        Warning Toast
      </button>

      <button onClick={() => toast.info('Just so you know...')}>
        Info Toast
      </button>
    </div>
  );
}
```

### Custom Duration

```tsx
const toast = useToast();

// Show for 3 seconds
toast.success('Quick message', { duration: 3000 });

// Show for 10 seconds
toast.error('Important error message', { duration: 10000 });

// Show permanently (must close manually)
toast.info('This stays until you close it', { duration: 0 });
```

### Toast with Title and Description

```tsx
const toast = useToast();

toast.success('', {
  title: 'Success!',
  description: 'Your changes have been saved successfully.',
  duration: 5000,
});

toast.error('', {
  title: 'Error',
  description: 'Failed to save changes. Please try again.',
  duration: 7000,
});
```

### Confirmation Toast with Action Buttons

```tsx
const toast = useToast();

// Using the confirm method (recommended)
toast.confirm(
  'Delete Student',
  'Are you sure you want to delete this student? This action cannot be undone.',
  () => {
    console.log('Student deleted!');
    // Perform delete action
  }
);

// Or with custom actions
toast.info('', {
  title: 'Unsaved Changes',
  description: 'You have unsaved changes. Do you want to save them?',
  duration: 0,
  actions: [
    {
      label: 'Save',
      onClick: () => console.log('Saving...'),
      variant: 'primary',
    },
    {
      label: 'Discard',
      onClick: () => console.log('Discarding...'),
      variant: 'secondary',
    },
  ],
});
```

### Toast Without Icon

```tsx
const toast = useToast();

toast.info('This toast has no icon', {
  showIcon: false,
});
```

### Form Submission

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

export function CreateStudentForm() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        toast.success('Student created successfully!');
        setName('');
      } else {
        toast.error('Failed to create student');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Student name"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  );
}
```

### Delete Confirmation

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/Dialog';

export function DeleteButton({ studentId }: { studentId: string }) {
  const toast = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      toast.success('Student deleted successfully');
      setShowConfirm(false);
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure?"
        variant="danger"
      />
    </>
  );
}
```

### File Upload Progress

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function FileUploader() {
  const toast = useToast();

  const handleUpload = async (file: File) => {
    toast.info('Uploading file...', 0); // Permanent toast

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error('Network error during upload');
    }
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />;
}
```

### Authentication Flow

```tsx
'use client';

import { signIn } from 'next-auth/react';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const toast = useToast();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', { redirect: false });

      if (result?.error) {
        toast.error('Login failed. Please try again.');
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}
```

### Practice Session Complete

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function FlashcardPractice() {
  const toast = useToast();

  const handleSessionComplete = (correctCount: number, total: number) => {
    const percentage = Math.round((correctCount / total) * 100);

    if (percentage >= 80) {
      toast.success(`Excellent! You got ${correctCount}/${total} correct!`, 7000);
    } else if (percentage >= 60) {
      toast.info(`Good job! You got ${correctCount}/${total} correct.`, 7000);
    } else {
      toast.warning(`Keep practicing! You got ${correctCount}/${total} correct.`, 7000);
    }
  };

  return (
    <button onClick={() => handleSessionComplete(18, 20)}>
      Complete Session
    </button>
  );
}
```

### Level Up Achievement

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function LevelUpNotification() {
  const toast = useToast();

  const handleLevelUp = (newLevel: string) => {
    toast.success(`🎉 Congratulations! You've advanced to level ${newLevel}!`, 8000);
  };

  return (
    <button onClick={() => handleLevelUp('B1')}>
      Simulate Level Up
    </button>
  );
}
```

### Multiple Toasts

```tsx
'use client';

import { useToast } from '@/components/ui/toast';

export function BatchOperations() {
  const toast = useToast();

  const handleBatchImport = async () => {
    toast.info('Starting import...');

    // Simulate processing
    setTimeout(() => {
      toast.success('20 words imported');
    }, 2000);

    setTimeout(() => {
      toast.warning('5 duplicates skipped');
    }, 2500);

    setTimeout(() => {
      toast.info('Import complete!');
    }, 3000);
  };

  return (
    <button onClick={handleBatchImport}>
      Import Words
    </button>
  );
}
```

---

## Use Cases in Testmanship

### 1. Student Actions
```tsx
// Adding flashcard
toast.success('Flashcard added to your deck!');

// Completing lesson
toast.success('Lesson completed! +50 XP');

// Streak milestone
toast.success('🔥 7-day streak! Keep it up!');
```

### 2. Teacher Actions
```tsx
// Creating assignment
toast.success('Assignment created and sent to students');

// Grading complete
toast.info('Grades have been published');

// Bulk import
toast.warning('Import complete with 3 errors');
```

### 3. Errors & Warnings
```tsx
// Network error
toast.error('Connection lost. Please check your internet.');

// Validation error
toast.warning('Please fill in all required fields');

// Session expiring
toast.warning('Your session will expire in 5 minutes', 10000);
```

### 4. System Notifications
```tsx
// Data saved
toast.info('Your progress has been saved');

// Update available
toast.info('A new version is available. Refresh to update.', 0);

// Maintenance
toast.warning('Scheduled maintenance in 30 minutes', 15000);
```

---

## Styling

Toasts use the project's design system:

- **Success**: Emerald-500 icon, emerald-200 border
- **Error**: Red-500 icon, red-200 border
- **Warning**: Amber-500 icon, amber-200 border
- **Info**: Blue-500 icon, blue-200 border
- **Background**: White with shadow
- **Position**: Top-right corner
- **Animation**: Slide in from right
- **Width**: Min 300px, Max 448px (28rem)

---

## Accessibility

✅ **Screen Reader Support**
- `role="alert"` on toast container
- `aria-live="polite"` for non-intrusive announcements
- `aria-atomic="true"` for complete message reading

✅ **Keyboard Support**
- Close button is keyboard accessible
- Focus management (doesn't steal focus)

✅ **Visual Indicators**
- Color-coded icons
- Clear messaging
- Close button visible on hover

---

## Best Practices

✅ **DO:**
- Keep messages short and clear
- Use appropriate variant for message type
- Provide actionable error messages
- Set reasonable durations (3-7 seconds)
- Use success toasts for positive feedback

❌ **DON'T:**
- Show too many toasts at once (max 3-4)
- Use toasts for critical errors (use Dialog instead)
- Write vague messages like "Error occurred"
- Set very short durations (<2 seconds)
- Use toasts for complex information

---

## Tips

💡 **Performance**: Toasts are rendered in a portal at the document root, preventing layout shifts

💡 **Stacking**: Multiple toasts stack vertically with 12px gap

💡 **Auto-dismiss**: Toasts auto-dismiss after duration, or can be manually closed

💡 **Positioning**: Fixed to top-right. Can be customized in ToastProvider component

💡 **Animation**: Smooth slide-in from right with fade effect
