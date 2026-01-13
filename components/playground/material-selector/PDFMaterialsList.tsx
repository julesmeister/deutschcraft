"use client";

import { type Material } from "@/lib/services/turso/materialsService";

interface PDFMaterialsListProps {
  materials: Material[];
  currentMaterialId?: string | null;
  onSelectMaterial: (material: Material) => void;
}

export function PDFMaterialsList({
  materials,
  currentMaterialId,
  onSelectMaterial,
}: PDFMaterialsListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">📭</div>
        <div className="text-sm">No PDF materials found</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {materials.map((material) => (
        <div
          key={material.materialId}
          className={`p-3 border transition-colors cursor-pointer ${
            currentMaterialId === material.materialId
              ? "bg-blue-50 border-blue-500"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => onSelectMaterial(material)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-neutral-900">
                {material.title}
              </h4>
              {material.description && (
                <p className="text-xs text-neutral-600 mt-1">
                  {material.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-xs font-medium">
                  {material.level}
                </span>
                <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium">
                  {material.category}
                </span>
              </div>
            </div>
            {currentMaterialId === material.materialId && (
              <div className="text-blue-500 text-xs font-medium">
                Currently Displayed
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
