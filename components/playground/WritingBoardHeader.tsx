/**
 * WritingBoardHeader Component
 * Header bar with title, word count, and public/private toggle
 */

interface WritingBoardHeaderProps {
  wordCount: number;
  currentUserRole: 'teacher' | 'student';
  isRoomPublicWriting: boolean;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
}

export function WritingBoardHeader({
  wordCount,
  currentUserRole,
  isRoomPublicWriting,
  onToggleRoomPublicWriting,
}: WritingBoardHeaderProps) {
  return (
    <div className="px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-neutral-900">Writing Board</h3>
        <span className="px-2.5 py-1 text-xs font-medium bg-white text-gray-600 rounded-full">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>
      {currentUserRole === 'teacher' && onToggleRoomPublicWriting && (
        <button
          onClick={() => onToggleRoomPublicWriting(!isRoomPublicWriting)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            isRoomPublicWriting
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {isRoomPublicWriting ? '🌐 All Public' : '🔒 Private'}
        </button>
      )}
    </div>
  );
}
