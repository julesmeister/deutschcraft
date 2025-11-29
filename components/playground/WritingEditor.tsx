/**
 * WritingEditor Component
 * Main textarea with auto-save functionality
 */

import { useRef } from 'react';
import { DictionaryLookup } from '@/components/dictionary/DictionaryLookup';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

interface WritingEditorProps {
  content: string;
  isOwnWriting: boolean;
  canEdit: boolean;
  selectedWritingUserName?: string;
  isSaving: boolean;
  lastSaved: Date | null;
  onContentChange: (content: string) => void;
}

export function WritingEditor({
  content,
  isOwnWriting,
  canEdit,
  selectedWritingUserName,
  isSaving,
  lastSaved,
  onContentChange,
}: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to insert text at cursor position
  const handleInsertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Clean the text: remove parentheses and their content
    let cleanText = text.replace(/\s*\([^)]*\)/g, '').trim();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Check if we need to add a space before
    const charBefore = start > 0 ? content[start - 1] : '';
    const needsSpaceBefore = charBefore && charBefore !== ' ' && charBefore !== '\n';

    // Check if we need to add a space after
    const charAfter = end < content.length ? content[end] : '';
    const needsSpaceAfter = charAfter && charAfter !== ' ' && charAfter !== '\n';

    // Build the final text with appropriate spacing
    const finalText = (needsSpaceBefore ? ' ' : '') + cleanText + (needsSpaceAfter ? ' ' : '');

    const newValue = content.substring(0, start) + finalText + content.substring(end);

    onContentChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + finalText.length, start + finalText.length);
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* German Character Autocomplete */}
      {canEdit && (
        <GermanCharAutocomplete
          textareaRef={textareaRef}
          content={content}
          onContentChange={onContentChange}
        />
      )}

      <div className="flex-1 flex flex-col px-8 pt-6 pb-8">
        {/* Status Bar - Show for own writing or when teacher is editing */}
        {canEdit && (
          <div className="flex items-center justify-end mb-4 gap-3">
            {/* Auto-save indicator */}
            <div className="text-xs text-gray-500">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">●</span> Saving...
                </span>
              ) : lastSaved ? (
                <span>Saved {formatTimeSince(lastSaved)}</span>
              ) : null}
            </div>
          </div>
        )}

        {/* Main Textarea - Borderless */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          disabled={!canEdit}
          placeholder={
            isOwnWriting
              ? 'Start writing in German...'
              : canEdit
                ? `Editing ${selectedWritingUserName}'s writing...`
                : `Viewing ${selectedWritingUserName}'s writing (read-only)`
          }
          className={`flex-1 w-full bg-transparent border-none outline-none resize-none text-2xl leading-relaxed ${
            canEdit
              ? 'text-gray-900 placeholder-gray-400'
              : 'text-gray-700 cursor-default'
          }`}
          style={{
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
          autoFocus={isOwnWriting}
        />
      </div>

      {/* Dictionary Lookup - Only show when user can edit */}
      {canEdit && (
        <>
          <div className="w-full h-px bg-gray-200" />
          <div className="px-8 py-4">
            <DictionaryLookup
              placeholder="Quick translate..."
              type="both"
              minChars={3}
              onInsertText={handleInsertText}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to format time since last save
function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
