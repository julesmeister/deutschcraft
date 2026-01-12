/**
 * Material Selector Component
 * Allows teachers to select PDFs from materials library to display in playground
 */

"use client";

import { useState, useEffect } from "react";
import { getPublicMaterials, type Material } from "@/lib/services/turso";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface MaterialSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: (
    materialId: string,
    title: string,
    url: string
  ) => Promise<void>;
  currentMaterialId?: string | null;
}

export function MaterialSelector({
  isOpen,
  onClose,
  onSelectMaterial,
  currentMaterialId,
}: MaterialSelectorProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const materialsData = await getPublicMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error("[MaterialSelector] Error loading materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || m.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleSelectMaterial = async (material: Material) => {
    await onSelectMaterial(
      material.materialId,
      material.title,
      material.filePath
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-200 shadow-lg">
        {/* Header */}
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

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-700"
          />

          <div className="flex flex-wrap gap-2">
            {["All", "A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2"].map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    selectedLevel === level
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              )
            )}
          </div>
        </div>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading materials...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-sm">No materials found</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((material) => (
                <div
                  key={material.materialId}
                  className={`p-3 border transition-colors cursor-pointer ${
                    currentMaterialId === material.materialId
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectMaterial(material)}
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
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {filteredMaterials.length} material
            {filteredMaterials.length !== 1 ? "s" : ""} available
          </div>
          <ActionButton onClick={onClose} variant="default">
            Close
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
