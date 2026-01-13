"use client";

import { ActionButton } from "@/components/ui/ActionButton";

type MaterialType = "pdf" | "audio";

interface MaterialSelectorFooterProps {
  materialType: MaterialType;
  pdfCount: number;
  audioCount: number;
  onClose: () => void;
}

export function MaterialSelectorFooter({
  materialType,
  pdfCount,
  audioCount,
  onClose,
}: MaterialSelectorFooterProps) {
  return (
    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
      <div className="text-xs text-gray-500">
        {materialType === "pdf" ? (
          <>
            {pdfCount} PDF material
            {pdfCount !== 1 ? "s" : ""} available
          </>
        ) : (
          <>
            {audioCount} audio file
            {audioCount !== 1 ? "s" : ""} available
          </>
        )}
      </div>
      <ActionButton onClick={onClose} variant="default">
        Close
      </ActionButton>
    </div>
  );
}
