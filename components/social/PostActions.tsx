'use client';

interface PostActionsProps {
  postId: string;
  currentUserId: string;
  authorId: string;
  onLike?: () => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onShare?: () => void;
  onToggleComments?: () => void;
  onToggleSuggestions?: () => void;
}

export default function PostActions({
  postId,
  currentUserId,
  authorId,
  onLike,
  onComment,
  onSuggest,
  onShare,
  onToggleComments,
  onToggleSuggestions
}: PostActionsProps) {
  const canSuggest = currentUserId !== authorId;

  return (
    <div className="py-1.5 mt-2">
      <div className="flex items-center gap-1 text-xs">
        <button
          className="flex items-center gap-1 py-1.5 px-3 text-gray-600 hover:bg-gray-50 rounded transition-colors"
          onClick={onLike}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
          </svg>
          <span>Like</span>
        </button>

        <button
          className="flex items-center gap-1 py-1.5 px-3 text-gray-600 hover:bg-gray-50 rounded transition-colors"
          onClick={onToggleComments || onComment}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15" />
          </svg>
          <span>Comment</span>
        </button>

        <button
          className="flex items-center gap-1 py-1.5 px-3 text-amber-600 hover:bg-amber-50 rounded transition-colors"
          onClick={onSuggest}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
          </svg>
          <span>Suggest</span>
        </button>
      </div>
    </div>
  );
}
