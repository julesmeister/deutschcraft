/**
 * TableCellOverlay — DOM overlay for Yoopta table cells
 * Scans editor DOM for table blocks, maps each <td> to (blockId, row, col),
 * and renders overlays for empty/pending cells.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NotebookEntry, CellAddress } from "@/lib/models/notebook";
import type { YooptaContentValue } from "@yoopta/editor";
import { CellInputPopover } from "./CellInputPopover";
import { CellEntryBadge } from "./CellEntryBadge";

interface CellOverlayData {
  address: CellAddress;
  rect: { top: number; left: number; width: number; height: number };
  isEmpty: boolean;
  pendingEntries: NotebookEntry[];
}

interface TableCellOverlayProps {
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
  editorKey: string;
  pageContent: YooptaContentValue | undefined;
  cellEntries: NotebookEntry[];
  isTeacher: boolean;
  userId: string;
  activeCellInput: CellAddress | null;
  onSetActiveCellInput: (addr: CellAddress | null) => void;
  onSubmitCellEntry: (address: CellAddress, text: string) => void;
  onReviewCellEntry: (entryId: string, status: "approved" | "rejected") => void;
}

/** Check if a Yoopta table cell is empty by inspecting its content structure */
function isCellEmpty(block: any, row: number, col: number): boolean {
  try {
    const cell = block.value?.[row]?.children?.[col];
    if (!cell) return false;
    const children = cell.children;
    if (!children || children.length === 0) return true;
    return children.every((child: any) => !child.text || child.text.trim() === "");
  } catch {
    return false;
  }
}

export function TableCellOverlay({
  editorContainerRef,
  editorKey,
  pageContent,
  cellEntries,
  isTeacher,
  userId,
  activeCellInput,
  onSetActiveCellInput,
  onSubmitCellEntry,
  onReviewCellEntry,
}: TableCellOverlayProps) {
  const [cells, setCells] = useState<CellOverlayData[]>([]);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scanCells = useCallback(() => {
    const container = editorContainerRef.current;
    if (!container || !pageContent) { setCells([]); return; }

    const containerRect = container.getBoundingClientRect();
    const overlays: CellOverlayData[] = [];

    // Find all Yoopta blocks with tables
    const blockEls = container.querySelectorAll("[data-yoopta-block-id]");
    blockEls.forEach((blockEl) => {
      const blockId = blockEl.getAttribute("data-yoopta-block-id");
      if (!blockId) return;

      const block = (pageContent as Record<string, any>)[blockId];
      if (!block) return;

      const table = blockEl.querySelector("table");
      if (!table) return;

      const trs = table.querySelectorAll("tr");
      trs.forEach((tr, rowIndex) => {
        const tds = tr.querySelectorAll("td, th");
        tds.forEach((td, colIndex) => {
          const tdRect = td.getBoundingClientRect();
          const relRect = {
            top: tdRect.top - containerRect.top + container.scrollTop,
            left: tdRect.left - containerRect.left + container.scrollLeft,
            width: tdRect.width,
            height: tdRect.height,
          };

          const address: CellAddress = { blockId, row: rowIndex, col: colIndex };
          const empty = isCellEmpty(block, rowIndex, colIndex);

          // Find pending cell entries for this exact cell
          const pending = cellEntries.filter(
            (e) =>
              e.blockId === blockId &&
              e.cellRow === rowIndex &&
              e.cellCol === colIndex &&
              e.status === "pending"
          );

          // Show overlay if cell is empty or has pending entries
          if (empty || pending.length > 0) {
            overlays.push({ address, rect: relRect, isEmpty: empty, pendingEntries: pending });
          }
        });
      });
    });

    setCells(overlays);
  }, [editorContainerRef, pageContent, cellEntries]);

  // Scan on mount, editorKey change, pageContent change, cellEntries change
  useEffect(() => {
    // Delay slightly to let Yoopta render
    const timeout = setTimeout(scanCells, 150);
    return () => clearTimeout(timeout);
  }, [scanCells, editorKey]);

  // MutationObserver + ResizeObserver to re-scan when DOM changes
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const debouncedScan = () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(scanCells, 200);
    };

    const mutationObserver = new MutationObserver(debouncedScan);
    mutationObserver.observe(container, { childList: true, subtree: true, characterData: true });

    const resizeObserver = new ResizeObserver(debouncedScan);
    resizeObserver.observe(container);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [editorContainerRef, scanCells]);

  // Re-scan on scroll
  useEffect(() => {
    const container = editorContainerRef.current?.closest(".overflow-y-auto");
    if (!container) return;
    const onScroll = () => scanCells();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [editorContainerRef, scanCells]);

  const containerHeight = editorContainerRef.current?.scrollHeight ?? 600;

  // Active popover cell
  const activeCell = activeCellInput
    ? cells.find(
        (c) =>
          c.address.blockId === activeCellInput.blockId &&
          c.address.row === activeCellInput.row &&
          c.address.col === activeCellInput.col
      )
    : null;

  return (
    <>
      {cells.map((cell) => {
        const key = `${cell.address.blockId}-${cell.address.row}-${cell.address.col}`;
        const hasPending = cell.pendingEntries.length > 0;

        // Teacher: show pending entries with review controls
        if (isTeacher && hasPending) {
          return (
            <div
              key={key}
              className="absolute pointer-events-auto"
              style={{
                top: cell.rect.top,
                left: cell.rect.left,
                width: cell.rect.width,
                height: cell.rect.height,
                zIndex: 10,
              }}
            >
              <div className="absolute inset-0 bg-amber-100/50 border-2 border-amber-300 rounded-sm" />
              <div className="absolute inset-0 flex items-center justify-center p-1">
                <CellEntryBadge
                  entries={cell.pendingEntries}
                  onReview={onReviewCellEntry}
                />
              </div>
            </div>
          );
        }

        // Student: empty cell with dashed border (clickable)
        if (!isTeacher && cell.isEmpty && !hasPending) {
          return (
            <div
              key={key}
              className="absolute cursor-pointer pointer-events-auto hover:bg-pastel-ocean/10 transition-colors"
              style={{
                top: cell.rect.top,
                left: cell.rect.left,
                width: cell.rect.width,
                height: cell.rect.height,
                zIndex: 10,
                border: "2px dashed rgba(119, 139, 235, 0.4)",
                borderRadius: 2,
              }}
              onClick={() => onSetActiveCellInput(cell.address)}
              title="Click to fill this cell"
            />
          );
        }

        // Student: cell has own pending entry — show amber tint
        if (!isTeacher && hasPending) {
          const ownPending = cell.pendingEntries.some((e) => e.userId === userId);
          if (ownPending) {
            return (
              <div
                key={key}
                className="absolute pointer-events-none"
                style={{
                  top: cell.rect.top,
                  left: cell.rect.left,
                  width: cell.rect.width,
                  height: cell.rect.height,
                  zIndex: 10,
                }}
              >
                <div className="absolute inset-0 bg-amber-100/40 border border-amber-200 rounded-sm flex items-center justify-center">
                  <span className="text-[9px] text-amber-600 font-medium">Pending</span>
                </div>
              </div>
            );
          }
        }

        return null;
      })}

      {/* Cell input popover for students */}
      {activeCell && !isTeacher && (
        <CellInputPopover
          address={activeCell.address}
          cellRect={activeCell.rect}
          containerHeight={containerHeight}
          onSubmit={onSubmitCellEntry}
          onCancel={() => onSetActiveCellInput(null)}
        />
      )}
    </>
  );
}
