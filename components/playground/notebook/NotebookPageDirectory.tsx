/**
 * NotebookPageDirectory — M3 Expressive style page directory
 * Rich tonal surface containers, playful rounded shapes, bold accents
 */

"use client";

import type { NotebookPage } from "@/lib/models/notebook";
import type { PageEntryStat } from "@/lib/services/turso/notebookService";

interface Props {
  pages: NotebookPage[];
  currentPageIndex: number;
  entryStats: Record<string, PageEntryStat>;
  currentUserId: string;
  currentUserName: string;
  onGoToPage: (index: number) => void;
}

// M3 Expressive — richer, warmer tonal surfaces with bolder accents
const TONAL = [
  { surface: "#F3EAFF", badge: "#E2D0F8", text: "#6B21A8", chip: "#EDE4F7" },  // purple
  { surface: "#DFEFFE", badge: "#C5E4FC", text: "#0369A1", chip: "#E0EFFC" },  // blue
  { surface: "#FFF3DB", badge: "#FFE6AD", text: "#A16207", chip: "#FFF0D4" },  // gold
  { surface: "#DCFCE7", badge: "#BBF7D0", text: "#15803D", chip: "#DEF7E7" },  // green
  { surface: "#FFE4E6", badge: "#FECDD3", text: "#BE123C", chip: "#FDE8EA" },  // red
  { surface: "#CCFBF1", badge: "#99F6E4", text: "#0F766E", chip: "#D5F5EE" },  // teal
];

const AVATAR_COLORS = ["#8B5CF6", "#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#14B8A6"];

function getPagePreview(page: NotebookPage): string {
  try {
    const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
    if (!content || typeof content !== "object") return "";
    const blocks = Object.values(content) as any[];
    blocks.sort((a: any, b: any) => (a?.meta?.order ?? 0) - (b?.meta?.order ?? 0));
    for (const block of blocks) {
      const elements = block?.value || [];
      const text = elements
        .map((el: any) => (el?.children || []).map((c: any) => c?.text || "").join(""))
        .join(" ")
        .trim();
      if (text) return text.slice(0, 80);
    }
    return "";
  } catch {
    return "";
  }
}

function getBlockCount(page: NotebookPage): number {
  try {
    const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
    if (!content || typeof content !== "object") return 0;
    return Object.keys(content).length;
  } catch {
    return 0;
  }
}

function formatRelativeDate(timestamp: number): string {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotebookPageDirectory({ pages, currentPageIndex, entryStats, currentUserId, currentUserName, onGoToPage }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {pages.map((page, i) => {
          const preview = getPagePreview(page);
          const blockCount = getBlockCount(page);
          const isCurrent = i === currentPageIndex;
          const tone = TONAL[i % TONAL.length];
          const stat = entryStats[page.pageId];
          // Merge page creator + entry contributors (deduplicated)
          const entryNames = stat?.contributors ?? [];
          const creatorName = page.createdBy === currentUserId ? currentUserName : null;
          const allNames = creatorName
            ? [creatorName, ...entryNames.filter(n => n !== creatorName)]
            : entryNames;
          const maxAvatars = 3;
          const overflow = Math.max(0, allNames.length - maxAvatars);
          const visibleContributors = allNames.slice(0, maxAvatars);

          return (
            <button
              key={page.pageId}
              onClick={() => onGoToPage(i)}
              className="w-full text-left rounded-[20px] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                backgroundColor: isCurrent ? tone.surface : "#F7F7F8",
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3.5">
                  {/* Page number — expressive rounded badge */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isCurrent ? tone.badge : "#EEEEEF" }}
                  >
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: isCurrent ? tone.text : "#9CA3AF" }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Title row + date */}
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className="text-[13px] font-semibold leading-snug truncate"
                        style={{ color: isCurrent ? tone.text : "#374151" }}
                      >
                        {page.title}
                      </p>
                      {page.updatedAt > 0 && (
                        <span className="text-[10px] whitespace-nowrap shrink-0" style={{ color: isCurrent ? tone.text + "99" : "#9CA3AF" }}>
                          {formatRelativeDate(page.updatedAt)}
                        </span>
                      )}
                    </div>

                    {/* Preview text */}
                    {preview ? (
                      <p className="text-[11px] leading-relaxed mt-1 line-clamp-2" style={{ color: isCurrent ? tone.text + "88" : "#9CA3AF" }}>
                        {preview}
                      </p>
                    ) : (
                      <p className="text-[11px] italic mt-1" style={{ color: "#C9C9CE" }}>Empty page</p>
                    )}

                    {/* Bottom row: chips + contributor avatars */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1.5">
                        {blockCount > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-[3px] rounded-full font-semibold"
                            style={{
                              backgroundColor: isCurrent ? tone.chip : "#EEEEEF",
                              color: isCurrent ? tone.text : "#9CA3AF",
                            }}
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h10" />
                            </svg>
                            {blockCount}
                          </span>
                        )}
                        {isCurrent && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-[3px] rounded-full font-semibold"
                            style={{ backgroundColor: tone.badge, color: tone.text }}
                          >
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="4" />
                            </svg>
                            Current
                          </span>
                        )}
                      </div>

                      {/* Contributor avatars — stacked */}
                      {allNames.length > 0 && (
                        <div className="flex items-center -space-x-1.5">
                          {visibleContributors.map((name, j) => (
                            <div
                              key={name}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white"
                              style={{
                                backgroundColor: AVATAR_COLORS[j % AVATAR_COLORS.length],
                                color: "#fff",
                                zIndex: maxAvatars - j,
                              }}
                              title={name}
                            >
                              {name[0]?.toUpperCase()}
                            </div>
                          ))}
                          {overflow > 0 && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ring-2 ring-white"
                              style={{ backgroundColor: "#D1D5DB", color: "#fff" }}
                            >
                              +{overflow}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
