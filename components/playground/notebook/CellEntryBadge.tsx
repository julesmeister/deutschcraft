/**
 * CellEntryBadge — Teacher review controls for pending cell entries
 * Shows submitter name, text preview, and approve/reject buttons.
 * If multiple pending entries exist for the same cell, shows count and cycles through them.
 */

"use client";

import { useState } from "react";
import type { NotebookEntry } from "@/lib/models/notebook";

interface CellEntryBadgeProps {
  entries: NotebookEntry[];
  onReview: (entryId: string, status: "approved" | "rejected") => void;
}

export function CellEntryBadge({ entries, onReview }: CellEntryBadgeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const entry = entries[currentIndex];
  if (!entry) return null;

  const text = (entry.content as { text?: string }).text ?? "";
  const hasMultiple = entries.length > 1;

  return (
    <div className="flex flex-col gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
      {/* Header: submitter + count */}
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-[10px] font-medium text-amber-700 truncate">
          {entry.userName}
        </span>
        {hasMultiple && (
          <span className="text-[9px] text-amber-500 shrink-0">
            ({currentIndex + 1}/{entries.length})
          </span>
        )}
      </div>

      {/* Text preview */}
      <div className="text-[11px] text-gray-700 truncate max-w-[120px]" title={text}>
        &ldquo;{text}&rdquo;
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onReview(entry.entryId, "approved")}
          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          title="Approve"
        >
          Approve
        </button>
        <button
          onClick={() => onReview(entry.entryId, "rejected")}
          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          title="Reject"
        >
          Reject
        </button>
        {hasMultiple && (
          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % entries.length)}
            className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Next entry"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
