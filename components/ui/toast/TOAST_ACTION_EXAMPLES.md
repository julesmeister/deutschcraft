# Action Toast Examples

Quick reference for using toasts with titles, descriptions, and action buttons.

## Simple Toasts (Icon + Message)

```tsx
const toast = useToast();

// Basic variants
toast.success('Student added!');
toast.error('Failed to save');
toast.warning('Session expiring soon');
toast.info('Changes auto-saved');
```

---

## Toasts with Title & Description

```tsx
const toast = useToast();

// Success with details
toast.success('', {
  title: 'Success!',
  description: 'Your profile has been updated successfully.',
});

// Error with details
toast.error('', {
  title: 'Upload Failed',
  description: 'The file size exceeds the maximum limit of 10MB.',
});

// Warning with details
toast.warning('', {
  title: 'Session Expiring',
  description: 'Your session will expire in 5 minutes. Please save your work.',
  duration: 10000,
});

// Info with details
toast.info('', {
  title: 'New Feature Available',
  description: 'Check out the new flashcard practice mode!',
});
```

---

## Confirmation Toasts (with Actions)

### Using the `confirm` Method

```tsx
const toast = useToast();

toast.confirm(
  'Delete Student',
  'Are you sure you want to remove this student from your class?',
  () => {
    // User confirmed
    deleteStudent();
  }
);
```

### Custom Action Buttons

```tsx
const toast = useToast();

// Unsaved changes prompt
toast.info('', {
  title: 'Unsaved Changes',
  description: 'You have unsaved changes. What would you like to do?',
  duration: 0, // Don't auto-dismiss
  actions: [
    {
      label: 'Save',
      onClick: () => handleSave(),
      variant: 'primary',
    },
    {
      label: 'Discard',
      onClick: () => handleDiscard(),
      variant: 'secondary',
    },
  ],
});

// Assignment ready
toast.success('', {
  title: 'Assignment Complete',
  description: 'Your assignment has been graded. View your results?',
  duration: 0,
  actions: [
    {
      label: 'View Results',
      onClick: () => router.push('/results'),
      variant: 'primary',
    },
    {
      label: 'Close',
      onClick: () => {},
      variant: 'secondary',
    },
  ],
});

// Multiple choice action
toast.warning('', {
  title: 'Import Complete',
  description: '20 words imported successfully. 5 duplicates were skipped.',
  duration: 0,
  actions: [
    {
      label: 'View Words',
      onClick: () => router.push('/words'),
      variant: 'primary',
    },
    {
      label: 'Import More',
      onClick: () => openImportDialog(),
      variant: 'secondary',
    },
  ],
});
```

---

## Real-World Examples

### 1. Delete Confirmation

```tsx
const handleDeleteClick = () => {
  toast.confirm(
    'Delete Flashcard Set',
    'This will permanently delete all flashcards in this set. This action cannot be undone.',
    async () => {
      await deleteFlashcardSet(setId);
      toast.success('Flashcard set deleted successfully');
    }
  );
};
```

### 2. Unsaved Form Changes

```tsx
const handleNavigateAway = (e: Event) => {
  if (hasUnsavedChanges) {
    e.preventDefault();

    toast.info('', {
      title: 'Unsaved Changes',
      description: 'You have unsaved changes. Do you want to save before leaving?',
      duration: 0,
      actions: [
        {
          label: 'Save & Leave',
          onClick: async () => {
            await saveChanges();
            navigate();
          },
          variant: 'primary',
        },
        {
          label: 'Leave Without Saving',
          onClick: () => navigate(),
          variant: 'secondary',
        },
      ],
    });
  }
};
```

### 3. Level Up Notification

```tsx
const handleLevelUp = (newLevel: string) => {
  toast.success('', {
    title: '🎉 Congratulations!',
    description: `You've advanced to ${newLevel}! Want to see what's new?`,
    duration: 10000,
    actions: [
      {
        label: 'Explore',
        onClick: () => router.push(`/levels/${newLevel}`),
        variant: 'primary',
      },
      {
        label: 'Later',
        onClick: () => {},
        variant: 'secondary',
      },
    ],
  });
};
```

### 4. Export Complete

```tsx
const handleExportComplete = (fileUrl: string) => {
  toast.success('', {
    title: 'Export Complete',
    description: 'Your progress report is ready to download.',
    duration: 0,
    actions: [
      {
        label: 'Download',
        onClick: () => window.open(fileUrl, '_blank'),
        variant: 'primary',
      },
      {
        label: 'Close',
        onClick: () => {},
        variant: 'secondary',
      },
    ],
  });
};
```

### 5. Maintenance Warning

```tsx
const showMaintenanceWarning = () => {
  toast.warning('', {
    title: 'Scheduled Maintenance',
    description: 'System maintenance will begin in 10 minutes. Please save your work.',
    duration: 0,
    actions: [
      {
        label: 'Save Now',
        onClick: () => saveAllChanges(),
        variant: 'primary',
      },
      {
        label: 'Remind Me Later',
        onClick: () => scheduleReminder(),
        variant: 'secondary',
      },
    ],
  });
};
```

### 6. Streak Achievement

```tsx
const handleStreakMilestone = (days: number) => {
  toast.success('', {
    title: `🔥 ${days}-Day Streak!`,
    description: `Amazing! You've practiced for ${days} days in a row. Keep it going!`,
    duration: 8000,
    actions: [
      {
        label: 'Share',
        onClick: () => shareAchievement(),
        variant: 'primary',
      },
      {
        label: 'Close',
        onClick: () => {},
        variant: 'secondary',
      },
    ],
  });
};
```

---

## Options Reference

### Simple Toast

```tsx
toast.success(message, {
  duration: 5000,        // Auto-dismiss time (0 = never)
  showIcon: true,        // Show success/error/warning icon
});
```

### Action Toast

```tsx
toast.info(message, {
  title: 'Title',        // Bold title text
  description: 'Desc',   // Description text (can use instead of message)
  duration: 0,           // Recommended: 0 for action toasts
  actions: [             // Action buttons
    {
      label: 'Confirm',
      onClick: () => {},
      variant: 'primary', // 'primary' (blue) or 'secondary' (white/bordered)
    },
  ],
});
```

### Confirm Method

```tsx
toast.confirm(
  title,              // Bold title
  description,        // Description text
  onConfirm,          // Callback when user confirms
  {
    duration: 5000,   // Optional: override default duration
  }
);
```

---

## Tips

✅ **DO:**
- Use `confirm()` for simple yes/no confirmations
- Set `duration: 0` for action toasts (don't auto-dismiss)
- Use primary variant for main action, secondary for cancel
- Keep titles short (3-5 words)
- Write clear, actionable descriptions

❌ **DON'T:**
- Auto-dismiss confirmation toasts
- Use more than 2-3 action buttons
- Make button labels vague ("OK", "Yes")
- Write long descriptions (keep under 2 sentences)
