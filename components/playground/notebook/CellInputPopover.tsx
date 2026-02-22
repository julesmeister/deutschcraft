/**
 * CellInputPopover — Student input popover for typing cell answers
 * Positioned relative to the clicked cell. Submit on Enter, cancel on Escape.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { CellAddress } from "@/lib/models/notebook";

interface CellInputPopoverProps {
  address: CellAddress;
  /** Rect of the target cell relative to the overlay container */
  cellRect: { top: number; left: number; width: number; height: number };
  containerHeight: number;
  onSubmit: (address: CellAddress, text: string) => void;
  onCancel: () => void;
}

export function CellInputPopover({
  address,
  cellRect,
  containerHeight,
  onSubmit,
  onCancel,
}: CellInputPopoverProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    await onSubmit(address, trimmed);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  // Position below cell, or above if not enough space
  const popoverHeight = 72;
  const spaceBelow = containerHeight - (cellRect.top + cellRect.height);
  const showAbove = spaceBelow < popoverHeight + 8;

  const style: React.CSSProperties = {
    position: "absolute",
    left: cellRect.left,
    width: Math.max(cellRect.width, 180),
    zIndex: 50,
    ...(showAbove
      ? { bottom: containerHeight - cellRect.top + 4 }
      : { top: cellRect.top + cellRect.height + 4 }),
  };

  return (
    <div style={style} className="bg-white rounded-lg shadow-lg border border-gray-200 p-2" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your answer..."
        disabled={loading}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-pastel-ocean transition-colors"
      />
      <div className="flex items-center justify-end gap-1.5 mt-1.5">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="px-2 py-0.5 text-xs font-medium rounded bg-pastel-ocean text-white hover:bg-pastel-ocean/80 disabled:opacity-40 transition-colors"
        >
          {loading ? "..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
