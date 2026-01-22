"use client";

import { useState, useEffect } from "react";
import { Label } from "../../ui/Label";
import { ExerciseAttachment } from "@/lib/models/exercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { getAllMaterials, Material } from "@/lib/services/turso/materialsService";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { SelectedPDFItem } from "./SelectedPDFItem";
import { PDFLibraryItem } from "./PDFLibraryItem";
import { PDFPreviewDialog } from "./PDFPreviewDialog";

interface PDFAttachmentSelectorProps {
  level: CEFRLevel;
  bookType: "AB" | "KB";
  lessonNumber: number;
  attachments: ExerciseAttachment[];
  onAttachmentsChange: (attachments: ExerciseAttachment[]) => void;
}

export function PDFAttachmentSelector({
  level,
  bookType,
  lessonNumber,
  attachments,
  onAttachmentsChange,
}: PDFAttachmentSelectorProps) {
  const [pdfMaterials, setPdfMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<ExerciseAttachment | null>(null);

  useEffect(() => {
    loadPdfMaterials();
  }, []);

  const loadPdfMaterials = async () => {
    setLoading(true);
    try {
      const allMaterials = await getAllMaterials();
      setPdfMaterials(allMaterials);
      setFilteredMaterials(allMaterials);
    } catch (error) {
      console.error("[PDFAttachmentSelector] Error loading materials:", error);
      setPdfMaterials([]);
      setFilteredMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter materials based on search query and level context
  useEffect(() => {
    let filtered = [...pdfMaterials];

    if (!showAllLessons) {
      filtered = filtered.filter((material) => {
        const levelMatch = material.level?.startsWith(level);
        const lessonMatch = !material.lessonNumber || material.lessonNumber === lessonNumber;
        return levelMatch && lessonMatch;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (material) =>
          material.title.toLowerCase().includes(query) ||
          material.category.toLowerCase().includes(query) ||
          (material.description && material.description.toLowerCase().includes(query))
      );
    }

    setFilteredMaterials(filtered);
  }, [searchQuery, pdfMaterials, showAllLessons, level, lessonNumber]);

  const currentLevelCount = pdfMaterials.filter((material) =>
    material.level?.startsWith(level)
  ).length;

  const pdfAttachments = attachments.filter((att) => att.type === "pdf");

  const handleAddPdf = (material: Material) => {
    if (attachments.some((att) => att.materialId === material.materialId)) {
      return;
    }
    const newAttachment: ExerciseAttachment = {
      type: "pdf",
      url: material.filePath,
      title: material.title,
      materialId: material.materialId,
    };
    onAttachmentsChange([...attachments, newAttachment]);
  };

  const handleRemovePdf = (materialId: string) => {
    onAttachmentsChange(attachments.filter((att) => att.materialId !== materialId));
  };

  const handleUpdatePageRange = (
    materialId: string,
    field: "pageStart" | "pageEnd",
    value: string
  ) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    const updated = attachments.map((att) => {
      if (att.materialId === materialId) {
        return {
          ...att,
          [field]: numValue && numValue > 0 ? numValue : undefined,
        };
      }
      return att;
    });
    onAttachmentsChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-gray-700">
          📄 PDF Attachments (Optional)
        </Label>
        {pdfMaterials.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide library
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Browse all {pdfMaterials.length} PDF files
              </>
            )}
          </button>
        )}
      </div>

      {/* Selected PDFs */}
      {pdfAttachments.length > 0 && (
        <div className="space-y-2 p-2 bg-orange-50 border border-orange-200">
          <p className="text-xs text-gray-600 font-semibold">
            Selected PDF files ({pdfAttachments.length}):
          </p>
          {pdfAttachments.map((attachment) => (
            <SelectedPDFItem
              key={attachment.materialId}
              attachment={attachment}
              onPreview={() => setPreviewAttachment(attachment)}
              onRemove={() => handleRemovePdf(attachment.materialId!)}
              onUpdatePageRange={(field, value) =>
                handleUpdatePageRange(attachment.materialId!, field, value)
              }
            />
          ))}
        </div>
      )}

      {/* PDF Library (collapsible) */}
      {expanded && (
        <div className="mt-3 border border-gray-200 bg-white">
          {/* Search and filters */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, category, or description..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAllLessons(false)}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    !showAllLessons
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {level} ({currentLevelCount})
                </button>
                <button
                  onClick={() => setShowAllLessons(true)}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    showAllLessons
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  All ({pdfMaterials.length})
                </button>
              </div>
              <p className="text-xs text-gray-500 ml-auto">
                {filteredMaterials.length} file{filteredMaterials.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Library content */}
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading PDF files...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery ? (
                <p>No PDF files match "{searchQuery}"</p>
              ) : !showAllLessons ? (
                <div className="space-y-2">
                  <p>No PDF files for {level}</p>
                  <button
                    onClick={() => setShowAllLessons(true)}
                    className="text-orange-600 hover:text-orange-700 underline text-xs"
                  >
                    Browse all PDF files
                  </button>
                </div>
              ) : (
                <p>No PDF files available</p>
              )}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {filteredMaterials.map((material) => (
                <PDFLibraryItem
                  key={material.materialId}
                  material={material}
                  isSelected={pdfAttachments.some(
                    (att) => att.materialId === material.materialId
                  )}
                  onAdd={() => handleAddPdf(material)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!expanded && pdfMaterials.length === 0 && !loading && (
        <p className="text-xs text-gray-500">No PDF files available in the library</p>
      )}

      {/* Preview Dialog */}
      {previewAttachment && (
        <PDFPreviewDialog
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  );
}
