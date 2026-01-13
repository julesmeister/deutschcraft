/**
 * Material Selector Component
 * Allows teachers to select PDFs and Audio files from materials library to display in playground
 */

"use client";

import { useState, useEffect } from "react";
import {
  getPublicMaterials,
  getPublicAudioMaterials,
  type Material,
  type AudioMaterial
} from "@/lib/services/turso/materialsService";
import { MaterialSelectorHeader } from "./material-selector/MaterialSelectorHeader";
import { MaterialTypeTabs } from "./material-selector/MaterialTypeTabs";
import { MaterialFilters } from "./material-selector/MaterialFilters";
import { PDFMaterialsList } from "./material-selector/PDFMaterialsList";
import { AudioMaterialsList } from "./material-selector/AudioMaterialsList";
import { MaterialSelectorFooter } from "./material-selector/MaterialSelectorFooter";

type MaterialType = "pdf" | "audio";

interface MaterialSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: (
    materialId: string,
    title: string,
    url: string,
    type: "pdf" | "audio"
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
  const [audioMaterials, setAudioMaterials] = useState<AudioMaterial[]>([]);
  const [materialType, setMaterialType] = useState<MaterialType>("pdf");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedBookType, setSelectedBookType] = useState<"All" | "KB" | "AB">("All");

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const [pdfData, audioData] = await Promise.all([
        getPublicMaterials(),
        getPublicAudioMaterials()
      ]);
      setMaterials(pdfData);
      setAudioMaterials(audioData);
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

  const filteredAudioMaterials = audioMaterials.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || a.level === selectedLevel;
    const matchesBookType = selectedBookType === "All" || a.bookType === selectedBookType;
    return matchesSearch && matchesLevel && matchesBookType;
  });

  const handleSelectPDF = async (material: Material) => {
    await onSelectMaterial(
      material.materialId,
      material.title,
      material.filePath,
      "pdf"
    );
    onClose();
  };

  const handleSelectAudio = async (audio: AudioMaterial) => {
    await onSelectMaterial(
      audio.audioId,
      audio.title,
      audio.fileUrl,
      "audio"
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-200 shadow-lg">
        <MaterialSelectorHeader onClose={onClose} />

        <MaterialTypeTabs
          materialType={materialType}
          setMaterialType={setMaterialType}
          pdfCount={materials.length}
          audioCount={audioMaterials.length}
        />

        <MaterialFilters
          materialType={materialType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedBookType={selectedBookType}
          setSelectedBookType={setSelectedBookType}
        />

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading materials...
            </div>
          ) : materialType === "pdf" ? (
            <PDFMaterialsList
              materials={filteredMaterials}
              currentMaterialId={currentMaterialId}
              onSelectMaterial={handleSelectPDF}
            />
          ) : (
            <AudioMaterialsList
              audioMaterials={filteredAudioMaterials}
              currentMaterialId={currentMaterialId}
              onSelectMaterial={handleSelectAudio}
            />
          )}
        </div>

        <MaterialSelectorFooter
          materialType={materialType}
          pdfCount={filteredMaterials.length}
          audioCount={filteredAudioMaterials.length}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
