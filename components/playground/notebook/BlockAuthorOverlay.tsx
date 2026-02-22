/**
 * BlockAuthorOverlay — cursor-style author indicators at the end of blocks
 * edited by someone other than the current user. Uses the same visual style
 * as NotebookCursor: colored vertical caret + name tag above it.
 * For teachers, shows approve (keep) / reject (undo) buttons.
 */

"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { BlockAuthor } from "@/lib/models/notebook";

const CURSOR_PALETTE = [
  "#8B5CF6", "#3B82F6", "#F59E0B",
  "#10B981", "#EF4444", "#14B8A6",
];

function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CURSOR_PALETTE[Math.abs(h) % CURSOR_PALETTE.length];
}

interface CursorItem {
  blockId: string;
  author: BlockAuthor;
  x: number;
  y: number;
  containerWidth: number;
}

interface BlockAuthorOverlayProps {
  editorContainerRef: RefObject<HTMLDivElement | null>;
  editorKey: string;
  blockAuthors: Record<string, BlockAuthor>;
  currentUserId: string;
  isTeacher: boolean;
  onRevertBlock?: (blockId: string) => void;
}

export function BlockAuthorOverlay({
  editorContainerRef,
  editorKey,
  blockAuthors,
  currentUserId,
  isTeacher,
  onRevertBlock,
}: BlockAuthorOverlayProps) {
  const [cursors, setCursors] = useState<CursorItem[]>([]);

  const scan = useCallback(() => {
    const container = editorContainerRef.current;
    if (!container) { setCursors([]); return; }

    const box = container.getBoundingClientRect();
    const results: CursorItem[] = [];

    const blockEls = container.querySelectorAll("[data-yoopta-block-id]");
    for (const el of blockEls) {
      const blockId = el.getAttribute("data-yoopta-block-id");
      if (!blockId) continue;
      const author = blockAuthors[blockId];
      if (!author || author.userId === currentUserId) continue;

      // Find the end of text content in this block
      const pos = getEndOfBlockPosition(el as HTMLElement, box);
      if (!pos) continue;

      results.push({
        blockId,
        author,
        x: pos.x,
        y: pos.y,
        containerWidth: box.width,
      });
    }

    setCursors(results);
  }, [editorContainerRef, blockAuthors, currentUserId]);

  useEffect(() => {
    const t = setTimeout(scan, 300);
    return () => clearTimeout(t);
  }, [scan, editorKey]);

  useEffect(() => {
    const scrollParent = editorContainerRef.current?.closest(".overflow-y-auto");
    if (!scrollParent) return;
    const onScroll = () => requestAnimationFrame(scan);
    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, [editorContainerRef, scan]);

  useEffect(() => {
    const interval = setInterval(scan, 2000);
    return () => clearInterval(interval);
  }, [scan]);

  if (cursors.length === 0) return null;

  return (
    <>
      {cursors.map((item) => {
        const color = getColor(item.author.userName);
        const flipLeft = item.x > item.containerWidth * 0.55;

        return (
          <div
            key={item.blockId}
            className="absolute"
            style={{ left: item.x, top: item.y, zIndex: 20 }}
          >
            {/* Name label + optional approve/reject — above the caret */}
            <div
              className={`absolute flex items-stretch gap-px pointer-events-auto whitespace-nowrap ${
                flipLeft ? "right-0 flex-row-reverse" : "left-0"
              }`}
              style={{ bottom: "100%" }}
            >
              <span
                className={`text-[9px] font-bold text-white px-1.5 py-px flex items-center ${
                  flipLeft
                    ? (isTeacher && onRevertBlock ? "" : "rounded-tl-md") + " rounded-tr-md"
                    : "rounded-tl-md" + (isTeacher && onRevertBlock ? "" : " rounded-tr-md")
                }`}
                style={{ backgroundColor: color }}
              >
                {item.author.userName}
              </span>
              {isTeacher && onRevertBlock && (
                <button
                  onClick={() => onRevertBlock(item.blockId)}
                  className={`px-1.5 flex items-center justify-center active:scale-90 ${
                    flipLeft ? "rounded-tl-md" : "rounded-tr-md"
                  }`}
                  style={{ backgroundColor: "#EF4444" }}
                  title="Undo this edit"
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Caret line */}
            <div className="w-0.5 rounded-full" style={{ backgroundColor: color, height: 18 }} />
          </div>
        );
      })}
    </>
  );
}

/**
 * Find the position at the end of the last text node inside a block element,
 * relative to the container. This places the cursor right after the last character.
 */
function getEndOfBlockPosition(
  blockEl: HTMLElement,
  containerBox: DOMRect
): { x: number; y: number } | null {
  // Walk backwards to find the last text node with content
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
  let lastTextNode: Text | null = null;
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.trim().length > 0) {
      lastTextNode = node;
    }
  }

  if (lastTextNode) {
    try {
      const range = document.createRange();
      range.setStart(lastTextNode, lastTextNode.length);
      range.collapse(true);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        return {
          x: rect.left - containerBox.left,
          y: rect.top - containerBox.top,
        };
      }
    } catch {
      // fallback below
    }
  }

  // Fallback: use the block element's right edge
  const blockRect = blockEl.getBoundingClientRect();
  return {
    x: blockRect.right - containerBox.left - 4,
    y: blockRect.top - containerBox.top + 4,
  };
}
