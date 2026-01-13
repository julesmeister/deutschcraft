"use client";

import { ActionButtonIcons } from "@/components/ui/ActionButton";

interface MaterialSelectorHeaderProps {
  onClose: () => void;
}

export function MaterialSelectorHeader({ onClose }: MaterialSelectorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 className="text-lg font-bold text-neutral-900">
        Select Material to Display
      </h3>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ActionButtonIcons.Close />
      </button>
    </div>
  );
}
