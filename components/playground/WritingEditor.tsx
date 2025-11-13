/**
 * WritingEditor Component
 * Main textarea with auto-save functionality
 */

interface WritingEditorProps {
  content: string;
  isOwnWriting: boolean;
  selectedWritingUserName?: string;
  isSaving: boolean;
  lastSaved: Date | null;
  onContentChange: (content: string) => void;
}

export function WritingEditor({
  content,
  isOwnWriting,
  selectedWritingUserName,
  isSaving,
  lastSaved,
  onContentChange,
}: WritingEditorProps) {
  return (
    <div className="flex-1 flex flex-col px-8 pt-6 pb-8">
      {/* Status Bar - Only show auto-save for own writing */}
      {isOwnWriting && (
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
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        disabled={!isOwnWriting}
        placeholder={
          isOwnWriting
            ? 'Start writing in German...'
            : `Viewing ${selectedWritingUserName}'s writing (read-only)`
        }
        className={`flex-1 w-full bg-transparent border-none outline-none resize-none text-2xl leading-relaxed ${
          isOwnWriting
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
