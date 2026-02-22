/**
 * NotebookCursor — live caret overlay with user name label and review buttons
 * Shows above the caret position inside the editor container.
 */

"use client";

import type { NotebookEntry } from "@/lib/models/notebook";

const CURSOR_PALETTE = [
  { bg: "#8B5CF6" }, { bg: "#3B82F6" }, { bg: "#F59E0B" },
  { bg: "#10B981" }, { bg: "#EF4444" }, { bg: "#14B8A6" },
];

function userCursorColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CURSOR_PALETTE[Math.abs(h) % CURSOR_PALETTE.length].bg;
}

interface NotebookCursorProps {
  cursorPos: { x: number; y: number };
  userName: string;
  isTeacher: boolean;
  pendingCount: number;
  firstPending: NotebookEntry | null;
  containerWidth: number;
  onReview: (entryId: string, status: "approved" | "rejected") => void;
}

export function NotebookCursor({
  cursorPos, userName, isTeacher, pendingCount, firstPending,
  containerWidth, onReview,
}: NotebookCursorProps) {
  const color = userCursorColor(userName);
  const canReview = isTeacher;
  const flipLeft = cursorPos.x > containerWidth * 0.55;

  return (
    <div
      className="absolute"
      style={{ left: cursorPos.x, top: cursorPos.y, zIndex: 20 }}
    >
      {/* Name label + approve/reject — all on one line above the caret */}
      <div
        className={`absolute flex items-stretch gap-px pointer-events-auto whitespace-nowrap ${flipLeft ? "right-0 flex-row-reverse" : "left-0"}`}
        style={{ bottom: "100%" }}
      >
        <span
          className={`text-[9px] font-bold text-white px-1.5 py-px flex items-center ${
            flipLeft
              ? (canReview && firstPending ? "" : "rounded-tl-md") + " rounded-tr-md"
              : "rounded-tl-md" + (canReview && firstPending ? "" : " rounded-tr-md")
          }`}
          style={{ backgroundColor: color }}
        >
          {userName}
          {pendingCount > 0 && (
            <span className="ml-1 opacity-80">({pendingCount})</span>
          )}
        </span>
        {canReview && firstPending && (
          <>
            <button
              onClick={() => onReview(firstPending.entryId, "approved")}
              className="px-1.5 flex items-center justify-center active:scale-90"
              style={{ backgroundColor: "#22C55E" }}
              title="Approve"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => onReview(firstPending.entryId, "rejected")}
              className={`px-1.5 flex items-center justify-center active:scale-90 ${flipLeft ? "rounded-tl-md" : "rounded-tr-md"}`}
              style={{ backgroundColor: "#EF4444" }}
              title="Reject"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
      {/* Caret line */}
      <div className="w-0.5 rounded-full" style={{ backgroundColor: color, height: 18 }} />
    </div>
  );
}
