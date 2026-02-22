/**
 * BlockAuthorOverlay — shows who last edited each block in the Yoopta editor.
 * Scans the editor DOM for block elements, matches them against the blockAuthors
 * map, and renders a small name tag on blocks edited by someone other than the viewer.
 */

"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { BlockAuthor } from "@/lib/models/notebook";

const AUTHOR_COLORS = [
  "#8B5CF6", "#3B82F6", "#F59E0B",
  "#10B981", "#EF4444", "#14B8A6",
];

function getAuthorColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AUTHOR_COLORS[Math.abs(h) % AUTHOR_COLORS.length];
}

interface BlockOverlayItem {
  blockId: string;
  author: BlockAuthor;
  top: number;
  height: number;
}

interface BlockAuthorOverlayProps {
  editorContainerRef: RefObject<HTMLDivElement | null>;
  editorKey: string;
  blockAuthors: Record<string, BlockAuthor>;
  currentUserId: string;
}

export function BlockAuthorOverlay({
  editorContainerRef,
  editorKey,
  blockAuthors,
  currentUserId,
}: BlockAuthorOverlayProps) {
  const [items, setItems] = useState<BlockOverlayItem[]>([]);

  const scan = useCallback(() => {
    const container = editorContainerRef.current;
    if (!container) { setItems([]); return; }

    const box = container.getBoundingClientRect();
    const results: BlockOverlayItem[] = [];

    // Yoopta renders blocks as [data-yoopta-block-id] elements
    const blockEls = container.querySelectorAll("[data-yoopta-block-id]");
    for (const el of blockEls) {
      const blockId = el.getAttribute("data-yoopta-block-id");
      if (!blockId) continue;
      const author = blockAuthors[blockId];
      if (!author || author.userId === currentUserId) continue;

      const rect = el.getBoundingClientRect();
      results.push({
        blockId,
        author,
        top: rect.top - box.top,
        height: rect.height,
      });
    }

    setItems(results);
  }, [editorContainerRef, blockAuthors, currentUserId]);

  // Re-scan on mount, editorKey change, blockAuthors change, and periodically
  useEffect(() => {
    // Initial scan after render
    const t = setTimeout(scan, 200);
    return () => clearTimeout(t);
  }, [scan, editorKey]);

  // Re-scan on scroll
  useEffect(() => {
    const container = editorContainerRef.current?.closest(".overflow-y-auto");
    if (!container) return;
    const onScroll = () => requestAnimationFrame(scan);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [editorContainerRef, scan]);

  // Periodic rescan for layout changes
  useEffect(() => {
    const interval = setInterval(scan, 2000);
    return () => clearInterval(interval);
  }, [scan]);

  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => {
        const color = getAuthorColor(item.author.userName);
        return (
          <div
            key={item.blockId}
            className="absolute pointer-events-none"
            style={{
              top: item.top,
              left: -2,
              height: item.height,
              zIndex: 10,
            }}
          >
            {/* Colored bar on the left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
            {/* Name tag */}
            <div
              className="absolute left-1.5 top-0 pointer-events-auto"
              style={{ transform: "translateY(-50%)" }}
            >
              <span
                className="text-[8px] font-bold text-white px-1 py-px rounded-sm whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {item.author.userName}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
