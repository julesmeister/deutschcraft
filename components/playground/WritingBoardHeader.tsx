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
  );
}
