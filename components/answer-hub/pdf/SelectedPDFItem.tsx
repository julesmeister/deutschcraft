"use client";

import { FileText, X, Eye } from "lucide-react";
import { ExerciseAttachment } from "@/lib/models/exercises";

interface SelectedPDFItemProps {
  attachment: ExerciseAttachment;
  onPreview: () => void;
  onRemove: () => void;
  onUpdatePageRange: (field: "pageStart" | "pageEnd", value: string) => void;
}

export function SelectedPDFItem({
  attachment,
  onPreview,
  onRemove,
  onUpdatePageRange,
}: SelectedPDFItemProps) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-white border border-orange-300">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onPreview}
          className="flex-shrink-0 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
          title="Preview PDF to find page numbers"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Page range inputs */}
      <div className="flex items-center gap-2 ml-7">
        <span className="text-xs text-gray-500">Page range:</span>
        <input
          type="number"
          min="1"
          value={attachment.pageStart || ""}
          onChange={(e) => onUpdatePageRange("pageStart", e.target.value)}
          placeholder="From"
          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="number"
          min="1"
          value={attachment.pageEnd || ""}
          onChange={(e) => onUpdatePageRange("pageEnd", e.target.value)}
          placeholder="To"
          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        {(attachment.pageStart || attachment.pageEnd) && (
          <span className="text-xs text-orange-600 font-medium">
            {attachment.pageEnd && attachment.pageStart
              ? `Pages ${attachment.pageStart}-${attachment.pageEnd}`
              : attachment.pageStart
              ? `Page ${attachment.pageStart}`
              : ""}
          </span>
        )}
      </div>
    </div>
  );
}
