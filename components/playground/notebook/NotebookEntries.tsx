/**
 * NotebookEntries — Persistent cursor-style contribution markers + student submission
 * Each pending entry = a colored cursor line with name label + approve/reject
 * Persisted in Turso DB — stays until teacher approves or rejects
 */

"use client";

import { useState, useMemo } from "react";
import type { NotebookEntry } from "@/lib/models/notebook";

const CURSOR_COLORS = [
  { bg: "#8B5CF6", light: "#F3EAFF", text: "#6B21A8" },
  { bg: "#3B82F6", light: "#DFEFFE", text: "#1D4ED8" },
  { bg: "#F59E0B", light: "#FFF3DB", text: "#A16207" },
  { bg: "#10B981", light: "#DCFCE7", text: "#15803D" },
  { bg: "#EF4444", light: "#FFE4E6", text: "#BE123C" },
  { bg: "#14B8A6", light: "#CCFBF1", text: "#0F766E" },
];

function getCursorColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

// ─── Entry Row — persistent cursor marker ───

export function EntryItem({
  entry,
  isTeacher,
  onReview,
}: {
  entry: NotebookEntry;
  isTeacher: boolean;
  onReview?: (entryId: string, status: "approved" | "rejected") => void;
}) {
  const cursor = getCursorColor(entry.userName);
  const isPending = entry.status === "pending";

  const textContent = useMemo(() => {
    try {
      const content = typeof entry.content === "string" ? JSON.parse(entry.content) : entry.content;
      if (!content || typeof content !== "object") return "";
      return Object.values(content)
        .map((block: any) => {
          const elements = block?.value || [];
          return elements
            .map((el: any) => el?.children?.map((c: any) => c?.text || "").join("") || "")
            .join(" ");
        })
        .filter(Boolean)
        .join(" ");
    } catch {
      return "";
    }
  }, [entry.content]);

  const barColor = isPending ? cursor.bg : entry.status === "approved" ? "#22C55E" : "#EF4444";

  return (
    <div className="relative pl-3">
      {/* Cursor line — persistent colored bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ backgroundColor: barColor }}
      />
      {/* Name label — sits on the cursor line like a collaborative caret */}
      <div
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md mb-1"
        style={{ backgroundColor: cursor.bg }}
      >
        <span className="text-[9px] font-bold text-white">{entry.userName}</span>
      </div>

      {/* Content */}
      <p className="text-[13px] text-neutral-700 leading-relaxed">
        {textContent || <em className="text-gray-300">empty</em>}
      </p>

      {/* Approve / Reject — always visible for teacher on pending entries */}
      {isTeacher && isPending && onReview && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={() => onReview(entry.entryId, "approved")}
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={() => onReview(entry.entryId, "rejected")}
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: "#FFE4E6", color: "#BE123C" }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      )}

      {/* Status dot for reviewed entries */}
      {!isPending && (
        <div className="flex items-center gap-1 mt-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: entry.status === "approved" ? "#22C55E" : "#EF4444" }}
          />
          <span className="text-[10px]" style={{ color: entry.status === "approved" ? "#15803D" : "#BE123C" }}>
            {entry.status === "approved" ? "Approved" : "Rejected"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Student Entry Editor ───

export function StudentEntryEditor({ onSubmit }: { onSubmit: (content: object) => Promise<void> }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const content = {
      "entry-block": {
        id: "entry-block",
        type: "Paragraph",
        value: [{ id: "entry-el", type: "paragraph", children: [{ text: text.trim() }] }],
        meta: { order: 0, depth: 0 },
      },
    };
    await onSubmit(content);
    setText("");
    setSubmitting(false);
  };

  return (
    <div className="px-5 py-3 border-t border-gray-100 shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Your contribution
        </h4>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="text-xs px-3 py-1 rounded-lg bg-pastel-ocean text-white hover:bg-pastel-ocean/80 transition-colors font-medium disabled:opacity-50"
        >
          Submit
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your contribution..."
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pastel-ocean/30 focus:border-pastel-ocean/50 transition-all"
      />
    </div>
  );
}
