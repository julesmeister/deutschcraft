"use client";

import { useState, useEffect } from "react";
import { Label } from "../ui/Label";
import { ExerciseAttachment } from "@/lib/models/exercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { getAllMaterials, Material } from "@/lib/services/turso/materialsService";
import { FileText, X, ChevronDown, ChevronUp, Search, Eye } from "lucide-react";
import { PDFViewer } from "@/components/playground/PDFViewer";

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

    // If not showing all, filter by level
    if (!showAllLessons) {
      filtered = filtered.filter((material) => {
        // Match level (handle both "B1" and "B1.2" formats)
        const levelMatch = material.level?.startsWith(level);
        // Match lesson number if it exists
        const lessonMatch = !material.lessonNumber || material.lessonNumber === lessonNumber;
        return levelMatch && lessonMatch;
      });
    }

    // Apply search query
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

  // Get count of matching files for current level
  const currentLevelCount = pdfMaterials.filter((material) =>
    material.level?.startsWith(level)
  ).length;

  const handleAddPdf = (material: Material) => {
    // Check if already added
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

  const pdfAttachments = attachments.filter((att) => att.type === "pdf");

  // Get category color
  const getCategoryColor = (category: Material["category"]) => {
    const colors: Record<string, string> = {
      Textbook: "text-purple-600 bg-purple-50",
      "Teaching Plan": "text-blue-600 bg-blue-50",
      "Copy Template": "text-green-600 bg-green-50",
      Test: "text-red-600 bg-red-50",
      Solutions: "text-amber-600 bg-amber-50",
      Transcripts: "text-cyan-600 bg-cyan-50",
      "Extra Materials": "text-gray-600 bg-gray-50",
    };
    return colors[category] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-3">
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

      {/* Current attachments */}
      {pdfAttachments.length > 0 && (
        <div className="space-y-2 p-2 bg-orange-50 border border-orange-200">
          <p className="text-xs text-gray-600 font-semibold">
            Selected PDF files ({pdfAttachments.length}):
          </p>
          {pdfAttachments.map((attachment) => (
            <div
              key={attachment.materialId}
              className="flex flex-col gap-2 p-2 bg-white border border-orange-300"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(attachment)}
                  className="flex-shrink-0 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                  title="Preview PDF to find page numbers"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePdf(attachment.materialId!)}
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
                  onChange={(e) =>
                    handleUpdatePageRange(attachment.materialId!, "pageStart", e.target.value)
                  }
                  placeholder="From"
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="number"
                  min="1"
                  value={attachment.pageEnd || ""}
                  onChange={(e) =>
                    handleUpdatePageRange(attachment.materialId!, "pageEnd", e.target.value)
                  }
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
          ))}
        </div>
      )}

      {/* PDF library (collapsible) */}
      {expanded && (
        <div className="mt-3 border border-gray-200 bg-white">
          {/* Search and filters */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
            {/* Search box */}
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

            {/* Filters */}
            <div className="flex items-center justify-between gap-2">
              {/* Level filter toggle */}
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

              {/* Results count */}
              <p className="text-xs text-gray-500 ml-auto">
                {filteredMaterials.length} file{filteredMaterials.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

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
              {filteredMaterials.map((material) => {
                const isSelected = pdfAttachments.some(
                  (att) => att.materialId === material.materialId
                );

                return (
                  <button
                    key={material.materialId}
                    type="button"
                    onClick={() => handleAddPdf(material)}
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
                      <span className="text-xs text-gray-500 font-medium">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!expanded && pdfMaterials.length === 0 && !loading && (
        <p className="text-xs text-gray-500">
          No PDF files available in the library
        </p>
      )}

      {/* PDF Preview Dialog */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[90vw] h-[85vh] max-w-5xl flex flex-col shadow-2xl rounded-lg overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Preview: {previewAttachment.title}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  (scroll to find the pages you need)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* PDF Viewer */}
            <div className="flex-1">
              <PDFViewer
                materialTitle={previewAttachment.title || "PDF Document"}
                materialUrl={previewAttachment.url}
                showCloseButton={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
