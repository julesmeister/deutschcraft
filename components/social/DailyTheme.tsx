'use client';

import { useState, useEffect } from 'react';
import { DailyTheme as DailyThemeType } from '@/lib/models/dailyTheme';

// Shared theme display component
function ThemeContent({ theme }: { theme: DailyThemeType }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">📝</span>
        <h6 className="font-bold text-gray-900 text-sm flex-1">{theme.title}</h6>
      </div>
      {theme.description && (
        <p className="text-sm text-gray-600 leading-relaxed ml-7">{theme.description}</p>
      )}
    </div>
  );
}

// Shared container with header
function ThemeContainer({
  children,
  action
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-gray-900">Today's Writing Theme</h5>
          {action}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Empty state
function EmptyState({ onSetTheme }: { onSetTheme?: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">📝</div>
      <p className="text-sm text-gray-600 mb-4">No theme set yet</p>
      {onSetTheme ? (
        <button
          onClick={onSetTheme}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          + Set Today's Theme
        </button>
      ) : (
        <p className="text-xs text-gray-400">Check back later for today's writing prompt</p>
      )}
    </div>
  );
}

// Editor form
function ThemeEditor({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isSaving,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Theme Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Describe your weekend"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          maxLength={100}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add details or instructions for students..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          rows={3}
          maxLength={300}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!title.trim() || isSaving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Theme'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Student display component
export function DailyThemeDisplay({
  theme,
  loading
}: {
  theme: DailyThemeType | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <ThemeContainer>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
        </div>
      </ThemeContainer>
    );
  }

  if (!theme) {
    return (
      <ThemeContainer>
        <EmptyState />
      </ThemeContainer>
    );
  }

  return (
    <ThemeContainer>
      <div className="space-y-3">
        <ThemeContent theme={theme} />
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <span className="text-base">✍️</span>
            <p className="text-xs font-medium text-gray-700">
              Write a post about this theme to practice!
            </p>
          </div>
        </div>
      </div>
    </ThemeContainer>
  );
}

// Teacher editor component
export function DailyThemeEditor({
  theme,
  batchId,
  teacherId,
  onSave
}: {
  theme: DailyThemeType | null;
  batchId: string;
  teacherId: string;
  onSave: (title: string, description: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (theme) {
      setTitle(theme.title);
      setDescription(theme.description);
    }
  }, [theme]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(title, description);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (theme) {
      setTitle(theme.title);
      setDescription(theme.description);
    } else {
      setTitle('');
      setDescription('');
    }
    setIsEditing(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ThemeContainer
      action={
        !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            ✏️ Edit
          </button>
        )
      }
    >
      {isEditing ? (
        <ThemeEditor
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      ) : theme ? (
        <div className="space-y-3">
          <ThemeContent theme={theme} />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated:</span>
            <span>{formatDate(theme.updatedAt)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
            <p className="text-xs text-gray-600">
              💡 Students in this batch can see this theme
            </p>
          </div>
        </div>
      ) : (
        <EmptyState onSetTheme={() => setIsEditing(true)} />
      )}
    </ThemeContainer>
  );
}
