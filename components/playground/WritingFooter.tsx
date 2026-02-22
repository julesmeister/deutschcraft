/**
 * WritingFooter Component
 * Footer with viewing info and public/private controls for teachers
 */

import type { PlaygroundWriting } from '@/lib/models/playground';

interface WritingFooterProps {
  selectedWriting: PlaygroundWriting | undefined;
  currentUserId: string;
  currentUserRole: 'teacher' | 'student';
  onTogglePublic: (writingId: string, currentIsPublic: boolean) => Promise<void>;
}

export function WritingFooter({
  selectedWriting,
  currentUserId,
  currentUserRole,
  onTogglePublic,
}: WritingFooterProps) {
  // Only show footer when viewing someone else's writing
  if (!selectedWriting || selectedWriting.userId === currentUserId) {
    return null;
  }

  return (
    <div className="mt-auto bg-gray-900 text-white text-sm py-3 px-8 rounded-b-3xl flex items-center justify-between">
      <div>
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

      {/* Teacher controls - Make Public/Private button */}
      {currentUserRole === 'teacher' && (
        <button
          onClick={() => onTogglePublic(selectedWriting.writingId, selectedWriting.isPublic)}
          className={`text-xs px-3 py-1.5 rounded-full transition-all ${
            selectedWriting.isPublic
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {selectedWriting.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
        </button>
      )}
    </div>
  );
}
