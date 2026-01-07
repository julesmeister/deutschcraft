"use client";

interface StudentAnswersHeaderProps {
  count: number;
  isCopying: boolean;
  onCopyForAI: () => void;
}

export function StudentAnswersHeader({
  count,
  isCopying,
  onCopyForAI,
}: StudentAnswersHeaderProps) {
  return (
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-lg font-black text-gray-900">Student Answers</h2>
        <span className="text-sm text-gray-600">
          ({count} student{count !== 1 ? "s" : ""})
        </span>

        <button
          onClick={onCopyForAI}
          disabled={isCopying}
          className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-md border border-purple-100 shadow-sm hover:shadow hover:bg-purple-50"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>{isCopying ? "Copied!" : "Copy for AI Review"}</span>
        </button>
      </div>
    </div>
  );
}
