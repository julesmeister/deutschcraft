/**
 * WritingBoard Component
 * Collaborative writing interface with borderless design and real-time auto-save
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { PlaygroundWriting } from '@/lib/models/playground';
import { updateWritingContent } from '@/lib/services/playgroundService';
import { WritingBoardHeader } from './WritingBoardHeader';
import { WritingTabs } from './WritingTabs';
import { WritingEditor } from './WritingEditor';
import { WritingFooter } from './WritingFooter';

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

  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // Update content when selected writing changes from Firestore (real-time sync)
  useEffect(() => {
    const selectedWriting = writings.find((w) => w.writingId === selectedWritingId);

    // Only update if viewing someone else's writing (not our own to avoid interrupting typing)
    if (selectedWriting && selectedWriting.userId !== currentUserId) {
      setContent(selectedWriting.content);
    }
  }, [writings, selectedWritingId, currentUserId]);

  // Auto-save effect - saves 1 second after user stops typing
  useEffect(() => {
    const selectedWriting = writings.find((w) => w.writingId === selectedWritingId);
    if (!selectedWriting) return;

    // Check if content has changed
    if (!content.trim()) return;
    if (content === selectedWriting.content) return;

    // Only auto-save if we can edit (own writing or teacher editing student)
    const canEdit = selectedWriting.userId === currentUserId || currentUserRole === 'teacher';
    if (!canEdit) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // For own writing, use onSaveWriting
        // For teacher editing student, use updateWritingContent
        if (selectedWriting.userId === currentUserId) {
          await onSaveWriting(content);
        } else {
          // Teacher editing student's writing
          await updateWritingContent(selectedWriting.writingId, content);
        }
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
  }, [content, selectedWritingId, writings, currentUserId, currentUserRole, onSaveWriting, onToggleWritingVisibility]);

  const handleTogglePublic = async (writingId: string, currentIsPublic: boolean) => {
    await onToggleWritingVisibility(writingId, !currentIsPublic);
  };

  const handleSelectWriting = (writingId: string | null, newContent: string) => {
    setSelectedWritingId(writingId);
    setContent(newContent);
  };

  const visibleWritings = writings;
  const otherWritings = visibleWritings.filter((w) => w.userId !== currentUserId);
  const selectedWriting = visibleWritings.find((w) => w.writingId === selectedWritingId);
  const isOwnWriting = selectedWritingId === (myWriting?.writingId || null);

  // Teachers can edit any writing, students can only edit their own
  const canEdit = isOwnWriting || currentUserRole === 'teacher';

  return (
    <div className="bg-white min-h-[600px] flex flex-col relative">
      {/* Top Header with Tabs */}
      <div className="border-b border-gray-200">
        <WritingBoardHeader
          wordCount={wordCount}
          currentUserRole={currentUserRole}
          isRoomPublicWriting={isRoomPublicWriting}
          onToggleRoomPublicWriting={onToggleRoomPublicWriting}
        />

        <WritingTabs
          myWriting={myWriting}
          otherWritings={otherWritings}
          selectedWritingId={selectedWritingId}
          currentUserId={currentUserId}
          isOwnWriting={isOwnWriting}
          onSelectWriting={handleSelectWriting}
        />
      </div>

      {/* Writing Area */}
      <WritingEditor
        content={content}
        isOwnWriting={isOwnWriting}
        canEdit={canEdit}
        selectedWritingUserName={selectedWriting?.userName}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onContentChange={setContent}
      />

      {/* Footer */}
      <WritingFooter
        selectedWriting={selectedWriting}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onTogglePublic={handleTogglePublic}
      />
    </div>
  );
}
