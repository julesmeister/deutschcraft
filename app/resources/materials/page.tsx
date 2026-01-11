/**
 * Materials Page
 * Browse and download PDF learning materials (Schritte International textbooks)
 */

"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import {
  getPublicMaterials,
  getAllMaterials,
  incrementDownloadCount,
  updateMaterialVisibility,
  type Material,
} from "@/lib/services/turso";
import { useToast } from "@/components/ui/toast";

type FilterLevel =
  | "All"
  | "A1.1"
  | "A1.2"
  | "A2.1"
  | "A2.2"
  | "B1.1"
  | "B1.2"
  | "General";
type FilterCategory =
  | "All"
  | "Textbook"
  | "Teaching Plan"
  | "Copy Template"
  | "Test"
  | "Solutions"
  | "Transcripts"
  | "Extra Materials";

export default function MaterialsPage() {
  const toast = useToast();
  const { session } = useFirebaseAuth();
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName, userRole } = getUserInfo(currentUser, session);

  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("All");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("All");

  const isTeacher = userRole === "teacher";

  useEffect(() => {
    if (userId) {
      loadMaterials();
    }
  }, [userId, isTeacher]);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, levelFilter, categoryFilter]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const materialsData = isTeacher
        ? await getAllMaterials()
        : await getPublicMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error("[Materials] Error loading materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply level filter
    if (levelFilter !== "All") {
      filtered = filtered.filter((m) => m.level === levelFilter);
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    setFilteredMaterials(filtered);
  };

  const handleDownload = async (material: Material) => {
    try {
      // Track download
      await incrementDownloadCount(material.materialId);

      // Open PDF in new tab
      window.open(material.filePath, "_blank");

      toast.success(`Opening ${material.title}`);
    } catch (error) {
      console.error("[Materials] Error downloading:", error);
      toast.error("Failed to open material");
    }
  };

  const handleToggleVisibility = async (material: Material) => {
    try {
      const newVisibility = !material.isPublic;
      await updateMaterialVisibility(material.materialId, newVisibility);

      // Update local state
      setMaterials((prev) =>
        prev.map((m) =>
          m.materialId === material.materialId
            ? { ...m, isPublic: newVisibility }
            : m
        )
      );

      toast.success(
        newVisibility
          ? "Material is now public"
          : "Material is now private (teachers only)"
      );
    } catch (error) {
      console.error("[Materials] Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Textbook":
        return "📚";
      case "Teaching Plan":
        return "📝";
      case "Copy Template":
        return "📋";
      case "Test":
        return "📊";
      case "Solutions":
        return "✅";
      case "Transcripts":
        return "🎧";
      case "Extra Materials":
        return "📁";
      default:
        return "📄";
    }
  };

  const levelOptions: FilterLevel[] = [
    "All",
    "A1.1",
    "A1.2",
    "A2.1",
    "A2.2",
    "B1.1",
    "B1.2",
    "General",
  ];
  const categoryOptions: FilterCategory[] = [
    "All",
    "Textbook",
    "Teaching Plan",
    "Copy Template",
    "Test",
    "Solutions",
    "Transcripts",
    "Extra Materials",
  ];

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Learning Materials 📚"
          subtitle="Loading materials..."
          backButton={{
            label: "Back to Dashboard",
            href: "/dashboard",
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <CatLoader message="Loading materials..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Learning Materials 📚"
        subtitle="Schritte International textbooks and supplementary materials"
        backButton={{
          label: "Back to Dashboard",
          href: "/dashboard",
        }}
      />

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Search and Filters */}
        <div className="bg-white border border-neutral-200 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials by title, description, or tags..."
                className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-700"
              />
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level Filter */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Filter by Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((level) => (
                    <button
                      key={level}
                      onClick={() => setLevelFilter(level)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        levelFilter === level
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        categoryFilter === category
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-xs text-neutral-500">
              Showing {filteredMaterials.length} of {materials.length} materials
              {isTeacher && " (including private materials)"}
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white border border-neutral-200 p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>📄</span>
            Available Materials
          </h3>

          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">No materials found</div>
              <div className="text-xs mt-1">
                Try adjusting your search or filters
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map((material) => (
                <div
                  key={material.materialId}
                  className="p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Material Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {getCategoryIcon(material.category)}
                        </span>
                        <h4 className="font-bold text-neutral-900">
                          {material.title}
                        </h4>
                      </div>

                      {material.description && (
                        <p className="text-xs text-neutral-600 mb-2">
                          {material.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-block align-middle px-2 py-0.5 bg-blue-500 text-white font-medium">
                          {material.level}
                        </span>
                        <span className="inline-block align-middle px-2 py-0.5 bg-gray-200 text-gray-700 font-medium">
                          {material.category}
                        </span>
                        {material.lessonNumber && (
                          <span className="inline-block align-middle text-neutral-500">
                            Lesson {material.lessonNumber}
                          </span>
                        )}
                        <span className="inline-block align-middle text-neutral-500">
                          {formatFileSize(material.fileSize)}
                        </span>
                        <span className="inline-block align-middle text-neutral-500">
                          {material.downloadCount} download
                          {material.downloadCount !== 1 ? "s" : ""}
                        </span>
                        {!material.isPublic && (
                          <span className="inline-block align-middle px-2 py-0.5 bg-yellow-500 text-white font-medium">
                            Private
                          </span>
                        )}
                      </div>

                      {material.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-neutral-500">
                            Tags:
                          </span>
                          {material.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block align-middle px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDownload(material)}
                        className="px-4 py-2 bg-gray-700 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                      >
                        Open PDF
                      </button>

                      {isTeacher && (
                        <button
                          onClick={() => handleToggleVisibility(material)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
