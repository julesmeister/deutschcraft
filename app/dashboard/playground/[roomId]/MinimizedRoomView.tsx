/**
 * Minimized Room View
 * Shown when the playground session is minimized
 */

"use client";

interface MinimizedRoomViewProps {
  onMaximize: () => void;
}

export function MinimizedRoomView({ onMaximize }: MinimizedRoomViewProps) {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <p className="text-sm font-medium">Session minimized</p>
        <p className="text-xs mt-1">Use the floating widget to restore</p>
        <button
          onClick={onMaximize}
          className="mt-4 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Restore Session
        </button>
      </div>
    </div>
  );
}
