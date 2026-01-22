"use client";

import { FileText } from "lucide-react";
import { Material } from "@/lib/services/turso/materialsService";

interface PDFLibraryItemProps {
  material: Material;
  isSelected: boolean;
  onAdd: () => void;
}

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  Textbook: "text-purple-600 bg-purple-50",
  "Teaching Plan": "text-blue-600 bg-blue-50",
  "Copy Template": "text-green-600 bg-green-50",
  Test: "text-red-600 bg-red-50",
  Solutions: "text-amber-600 bg-amber-50",
  Transcripts: "text-cyan-600 bg-cyan-50",
  "Extra Materials": "text-gray-600 bg-gray-50",
};

export function getCategoryColor(category: Material["category"]): string {
  return CATEGORY_COLORS[category] || "text-gray-600 bg-gray-50";
}

export function PDFLibraryItem({
  material,
  isSelected,
  onAdd,
}: PDFLibraryItemProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isSelected}
      className={`w-full flex items-center gap-3 p-3 text-left border-b border-gray-200 last:border-b-0 transition-colors ${
        isSelected
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "hover:bg-gray-50 cursor-pointer"
      }`}
    >
      <FileText
        className={`w-4 h-4 flex-shrink-0 ${
          isSelected ? "text-gray-400" : "text-orange-600"
        }`}
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isSelected ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {material.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium">{material.level}</span>
          <span>•</span>
          <span className={`px-1.5 py-0.5 rounded ${getCategoryColor(material.category)}`}>
            {material.category}
          </span>
          {material.lessonNumber && (
            <>
              <span>•</span>
              <span>L{material.lessonNumber}</span>
            </>
          )}
        </div>
      </div>
      {isSelected && (
        <span className="text-xs text-gray-500 font-medium">Added</span>
      )}
    </button>
  );
}
