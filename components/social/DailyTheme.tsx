'use client';

import { useState, useEffect, useRef } from 'react';
import { DailyTheme as DailyThemeType } from '@/lib/models/dailyTheme';
import { useToast } from '@/components/ui/toast';
import { formatRelativeTime } from '@/lib/utils/dateHelpers';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

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
  action,
  lastUpdated
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  lastUpdated?: number;
}) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-gray-900">Suggest Topic</h5>
          <div className="flex items-center gap-2">
            {action}
            {lastUpdated && (
              <span className="text-xs text-gray-400">{formatRelativeTime(lastUpdated)}</span>
            )}
          </div>
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

// Editor form - Subtle inline style with auto-save
function ThemeEditor({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isSaving,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
}) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="What should students write about today?"
          className="w-full px-2 py-1.5 bg-transparent border-0 focus:outline-none text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-colors resize-none overflow-hidden"
          maxLength={100}
          rows={1}
          style={{ minHeight: '2rem' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <GermanCharAutocomplete
          textareaRef={titleRef}
          content={title}
          onContentChange={onTitleChange}
        />
      </div>
      <div className="relative">
        <textarea
          ref={descriptionRef}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add optional details or instructions..."
          className="w-full px-2 py-1.5 bg-transparent border-0 focus:outline-none text-sm text-gray-600 placeholder:text-gray-400 resize-none"
          rows={2}
          maxLength={300}
        />
        <GermanCharAutocomplete
          textareaRef={descriptionRef}
          content={description}
          onContentChange={onDescriptionChange}
        />
      </div>
      {isSaving && (
        <p className="text-xs text-gray-400 animate-pulse">
          Saving...
        </p>
      )}
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
    <ThemeContainer lastUpdated={theme.updatedAt}>
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastThemeIdRef = useRef<string | null>(null);
  const { success, error } = useToast();

  // Only sync state when theme ID changes (switching batches) or initial load
  // Don't sync when theme updates from our own save
  useEffect(() => {
    const themeId = theme?.themeId || null;

    // Only update if theme ID actually changed
    if (lastThemeIdRef.current !== themeId) {
      if (theme) {
        setTitle(theme.title);
        setDescription(theme.description);
      } else {
        setTitle('');
        setDescription('');
      }
      lastThemeIdRef.current = themeId;
    }
  }, [theme?.themeId, batchId]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(title, description);
      success('Theme saved successfully', { duration: 2000 });
    } catch (err) {
      console.error('Error saving theme:', err);
      error('Failed to save theme', { duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with 2-second debounce
  const handleTitleChange = (value: string) => {
    setTitle(value);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (only if title is not empty)
    if (value.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (only if title exists)
    if (title.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ThemeContainer lastUpdated={theme?.updatedAt}>
      <div className="space-y-3">
        {/* Always show editor */}
        <ThemeEditor
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          isSaving={isSaving}
        />
      </div>
    </ThemeContainer>
  );
}
