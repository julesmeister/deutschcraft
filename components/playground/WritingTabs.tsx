/**
 * WritingTabs Component
 * Tab navigation for switching between different users' writings
 */

import type { PlaygroundWriting } from '@/lib/models/playground';

interface WritingTabsProps {
  myWriting?: PlaygroundWriting;
  otherWritings: PlaygroundWriting[];
  selectedWritingId: string | null;
  currentUserId: string;
  currentUserRole: 'teacher' | 'student';
  isOwnWriting: boolean;
  hostId: string; // Added to identify the host
  onSelectWriting: (writingId: string | null, content: string) => void;
}

export function WritingTabs({
  myWriting,
  otherWritings,
  selectedWritingId,
  currentUserId,
  currentUserRole,
  isOwnWriting,
  hostId,
  onSelectWriting,
}: WritingTabsProps) {
  // For teachers: My Writing first, then others
  // For students: Host's writing first, then My Writing
  const isTeacher = currentUserRole === 'teacher';

  return (
    <div className="flex border-t border-gray-200 bg-white">
      {isTeacher ? (
        <>
          {/* Teacher view: My Writing first (left) */}
          <button
            onClick={() => onSelectWriting(myWriting?.writingId || null, myWriting?.content || '')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              isOwnWriting
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Writing
          </button>

          {/* Then student writings */}
          {otherWritings.map((writing) => (
            <button
              key={writing.writingId}
              onClick={() => onSelectWriting(writing.writingId, writing.content)}
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
        </>
      ) : (
        <>
          {/* Student view: Host's writing first (left) */}
          {otherWritings.map((writing) => {
            const isHost = writing.userId === hostId;
            return (
              <button
                key={writing.writingId}
                onClick={() => onSelectWriting(writing.writingId, writing.content)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedWritingId === writing.writingId
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {writing.userName}
                {isHost && <span className="ml-1 text-xs font-normal text-gray-500">(Host)</span>}
                {writing.isPublic && <span className="ml-1 text-xs">🌐</span>}
              </button>
            );
          })}

          {/* Then My Writing */}
          <button
            onClick={() => onSelectWriting(myWriting?.writingId || null, myWriting?.content || '')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              isOwnWriting
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Writing
          </button>
        </>
      )}
    </div>
  );
}
