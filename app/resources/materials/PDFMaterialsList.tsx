/**
 * PDF Materials List Component
 * Displays PDF materials with download and visibility controls
 */

"use client";

import type { Material } from "@/lib/services/turso/materialsService";
import { getCategoryIcon, formatFileSize } from "./types";

interface PDFMaterialsListProps {
  materials: Material[];
  onDownload: (material: Material) => void;
  onToggleVisibility: (material: Material) => void;
  isTeacher: boolean;
}

export function PDFMaterialsList({
  materials,
  onDownload,
  onToggleVisibility,
  isTeacher,
}: PDFMaterialsListProps) {
  if (materials.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <div className="text-center py-12 text-neutral-400">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-sm">No PDF materials found</div>
          <div className="text-xs mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 p-6">
      <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <span>📄</span>
        Available PDF Materials
      </h3>

      <div className="space-y-3">
        {materials.map((material) => (
          <PDFMaterialCard
            key={material.materialId}
            material={material}
            onDownload={onDownload}
            onToggleVisibility={onToggleVisibility}
            isTeacher={isTeacher}
          />
        ))}
      </div>
    </div>
  );
}

// PDF Material Card Component
function PDFMaterialCard({
  material,
  onDownload,
  onToggleVisibility,
  isTeacher,
}: {
  material: Material;
  onDownload: (material: Material) => void;
  onToggleVisibility: (material: Material) => void;
  isTeacher: boolean;
}) {
  return (
    <div className="p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getCategoryIcon(material.category)}</span>
            <h4 className="font-bold text-neutral-900">{material.title}</h4>
          </div>

          {material.description && (
            <p className="text-xs text-neutral-600 mb-2">
              {material.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-block px-2 py-0.5 bg-blue-500 text-white font-medium">
              {material.level}
            </span>
            <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 font-medium">
              {material.category}
            </span>
            {material.lessonNumber && (
              <span className="text-neutral-500">
                Lesson {material.lessonNumber}
              </span>
            )}
            <span className="text-neutral-500">
              {formatFileSize(material.fileSize)}
            </span>
            <span className="text-neutral-500">
              {material.downloadCount} download
              {material.downloadCount !== 1 ? "s" : ""}
            </span>
            {!material.isPublic && (
              <span className="inline-block px-2 py-0.5 bg-yellow-500 text-white font-medium">
                Private
              </span>
            )}
          </div>

          {material.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500">Tags:</span>
              {material.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDownload(material)}
            className="px-4 py-2 bg-gray-700 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            Open PDF
          </button>

          {isTeacher && (
            <button
              onClick={() => onToggleVisibility(material)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                material.isPublic
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {material.isPublic ? "Public" : "Private"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
