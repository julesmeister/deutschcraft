/**
 * WritingBoard Component
 * Collaborative writing interface with borderless design and real-time auto-save
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { PlaygroundWriting } from '@/lib/models/playground';

interface WritingBoardProps {
  writings: PlaygroundWriting[];
  currentUserId: string;
  currentUserRole: 'teacher' | 'student';
  myWriting?: PlaygroundWriting;
  isRoomPublicWriting: boolean;
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (writingId: string, isPublic: boolean) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
}

export function WritingBoard({
  writings,
  currentUserId,
  currentUserRole,
  myWriting,
  isRoomPublicWriting,
  onSaveWriting,
  onToggleWritingVisibility,
  onToggleRoomPublicWriting,
}: WritingBoardProps) {
  const [content, setContent] = useState(myWriting?.content || '');
  const [selectedWritingId, setSelectedWritingId] = useState<string | null>(
    myWriting?.writingId || null
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update content when selected writing changes from Firestore (real-time sync)
  useEffect(() => {
    const selectedWriting = writings.find((w) => w.writingId === selectedWritingId);

    // Only update if viewing someone else's writing (not our own to avoid interrupting typing)
    if (selectedWriting && selectedWriting.userId !== currentUserId) {
      setContent(selectedWriting.content);
    }
  }, [writings, selectedWritingId, currentUserId]);

  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // Auto-save effect - saves 1 second after user stops typing
  useEffect(() => {
    // Only auto-save for own writing
    if (selectedWritingId !== (myWriting?.writingId || null)) return;
    if (!content.trim()) return;
    if (content === myWriting?.content) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSaveWriting(content);
        setLastSaved(new Date());
      } catch (error) {
        console.error('[WritingBoard] Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, selectedWritingId, myWriting?.writingId, myWriting?.content, onSaveWriting]);

  const handleTogglePublic = async (writingId: string, currentIsPublic: boolean) => {
    await onToggleWritingVisibility(writingId, !currentIsPublic);
  };

  const visibleWritings = writings;
  const selectedWriting = visibleWritings.find((w) => w.writingId === selectedWritingId);
  const isOwnWriting = selectedWritingId === (myWriting?.writingId || null);

  return (
    <div className="bg-white min-h-[600px] flex flex-col">
      {/* Top Header with Tabs - Matches WritingWorkspace style */}
      <div className="border-b border-gray-200">
        {/* Top bar with controls */}
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-neutral-900">Writing Board</h3>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          {currentUserRole === 'teacher' && onToggleRoomPublicWriting && (
            <button
              onClick={() => onToggleRoomPublicWriting(!isRoomPublicWriting)}
              className={`text-xs font-medium px-3 py-1 border transition-all ${
                isRoomPublicWriting
                  ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isRoomPublicWriting ? '🌐 All Public' : '🔒 Private'}
            </button>
          )}
        </div>

        {/* Tabs Navigation - Matches WritingWorkspace tab style */}
        <div className="flex border-t border-gray-200">
          {/* My Writing Tab */}
          <button
            onClick={() => {
              setSelectedWritingId(myWriting?.writingId || null);
              setContent(myWriting?.content || '');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              isOwnWriting
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Writing
          </button>

          {/* Other visible writings */}
          {visibleWritings
            .filter((w) => w.userId !== currentUserId)
            .map((writing) => (
              <button
                key={writing.writingId}
                onClick={() => {
                  setSelectedWritingId(writing.writingId);
                  setContent(writing.content);
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedWritingId === writing.writingId
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {writing.userName}
                {writing.isPublic && <span className="ml-1 text-xs">🌐</span>}
              </button>
            ))}
        </div>
      </div>

      {/* Writing Area - Borderless */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-8">
        {/* Status Bar */}
        {(isOwnWriting || (selectedWriting && currentUserRole === 'teacher' && selectedWriting.userId !== currentUserId)) && (
          <div className="flex items-center justify-end mb-4 gap-3">
            {/* Auto-save indicator */}
            {isOwnWriting && (
              <div className="text-xs text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">●</span> Saving...
                  </span>
                ) : lastSaved ? (
                  <span>Saved {formatTimeSince(lastSaved)}</span>
                ) : null}
              </div>
            )}

            {/* Teacher controls */}
            {selectedWriting && currentUserRole === 'teacher' && selectedWriting.userId !== currentUserId && (
              <button
                onClick={() =>
                  handleTogglePublic(
                    selectedWriting.writingId,
                    selectedWriting.isPublic
                  )
                }
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedWriting.isPublic
                    ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {selectedWriting.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
              </button>
            )}
          </div>
        )}

        {/* Main Textarea - Borderless */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isOwnWriting}
          placeholder={
            isOwnWriting
              ? 'Start writing in German...'
              : `Viewing ${selectedWriting?.userName}'s writing (read-only)`
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

        {/* Info Message for viewing others */}
        {selectedWriting && selectedWriting.userId !== currentUserId && (
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
            {currentUserRole === 'teacher' ? (
              <>
                Viewing <strong>{selectedWriting.userName}</strong>'s writing.
                You can {selectedWriting.isPublic ? 'make it private' : 'share it with everyone'}.
              </>
            ) : (
              <>
                Viewing <strong>{selectedWriting.userName}</strong>'s public writing.
              </>
            )}
          </div>
        )}
      </div>
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
