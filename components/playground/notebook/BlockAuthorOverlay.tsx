/**
 * BlockAuthorOverlay — always-visible author indicators on blocks edited by others.
 * Shows a colored left border + name tag on every block the current user didn't edit.
 * Scans the editor DOM for [data-yoopta-block-id] elements and overlays markers.
 */

"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { BlockAuthor } from "@/lib/models/notebook";

const AUTHOR_COLORS = [
  { bg: "#8B5CF6", light: "rgba(139,92,246,0.08)" },
  { bg: "#3B82F6", light: "rgba(59,130,246,0.08)" },
  { bg: "#F59E0B", light: "rgba(245,158,11,0.08)" },
  { bg: "#10B981", light: "rgba(16,185,129,0.08)" },
  { bg: "#EF4444", light: "rgba(239,68,68,0.08)" },
  { bg: "#14B8A6", light: "rgba(20,184,166,0.08)" },
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
  left: number;
  width: number;
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
        left: rect.left - box.left,
        width: rect.width,
        height: rect.height,
      });
    }

    setItems(results);
  }, [editorContainerRef, blockAuthors, currentUserId]);

  // Scan after render / data changes
  useEffect(() => {
    const t = setTimeout(scan, 300);
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

  // Periodic rescan for layout shifts
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
              left: item.left,
              width: item.width,
              height: item.height,
              zIndex: 10,
            }}
          >
            {/* Tinted background */}
            <div
              className="absolute inset-0 rounded-md"
              style={{ backgroundColor: color.light }}
            />
            {/* Left border bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
              style={{ backgroundColor: color.bg }}
            />
            {/* Name tag pinned to top-right */}
            <div className="absolute right-0 top-0" style={{ transform: "translateY(-50%)" }}>
              <span
                className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm"
                style={{ backgroundColor: color.bg }}
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
