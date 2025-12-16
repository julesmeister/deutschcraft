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

// Editor form - Subtle inline style
function ThemeEditor({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  isSaving,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="📝 What should students write about today?"
          className="w-full px-2 py-1.5 bg-transparent border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-colors"
          maxLength={100}
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add optional details or instructions..."
          className="w-full px-2 py-1.5 bg-transparent border-0 focus:outline-none text-sm text-gray-600 placeholder:text-gray-400 resize-none"
          rows={2}
          maxLength={300}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          {title.trim() ? '✓ Theme will be saved automatically' : 'Enter a theme title to save'}
        </p>
        <button
          onClick={onSave}
          disabled={!title.trim() || isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (theme) {
      setTitle(theme.title);
      setDescription(theme.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [theme]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(title, description);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ThemeContainer>
      <div className="space-y-4">
        {/* Always show editor */}
        <ThemeEditor
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Show last updated info if theme exists */}
        {theme && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>💡 Students in this batch can see this theme</span>
              <span>Updated {formatDate(theme.updatedAt)}</span>
            </div>
          </div>
        )}
      </div>
    </ThemeContainer>
  );
}
