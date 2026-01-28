/**
 * Materials Page
 * Browse and download PDF learning materials + Audio materials (MP3)
 */

"use client";

import { useState, useEffect, useRef } from "react";
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
  getPublicAudioMaterials,
  getAllAudioMaterials,
  incrementPlayCount,
  type Material,
  type AudioMaterial,
} from "@/lib/services/turso/materialsService";
import { useToast } from "@/components/ui/toast";
import { getPlayableUrl } from "@/lib/utils/urlHelpers";
import { AudioMaterialsList } from "./AudioMaterialsList";
import { PDFMaterialsList } from "./PDFMaterialsList";
import {
  type FilterLevel,
  type FilterCategory,
  type MaterialType,
  LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
} from "./types";

export default function MaterialsPage() {
  const toast = useToast();
  const { session } = useFirebaseAuth();
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userRole } = getUserInfo(currentUser, session);

  const [loading, setLoading] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>("audio");

  // PDF Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  // Audio Materials state
  const [audioMaterials, setAudioMaterials] = useState<AudioMaterial[]>([]);
  const [filteredAudioMaterials, setFilteredAudioMaterials] = useState<
    AudioMaterial[]
  >([]);
  const [audioMaterialsLoaded, setAudioMaterialsLoaded] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("All");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("All");
  const [bookTypeFilter, setBookTypeFilter] = useState<"All" | "KB" | "AB">(
    "All"
  );

  const isTeacher = userRole === "teacher";

  // Load data for the currently selected tab only (lazy loading)
  useEffect(() => {
    if (userId) {
      if (materialType === "audio" && !audioMaterialsLoaded) {
        loadAudioMaterials();
      } else if (materialType === "pdf" && !materialsLoaded) {
        loadPDFMaterials();
      }
    }
  }, [userId, isTeacher, materialType]);

  useEffect(() => {
    if (materialType === "pdf") {
      filterMaterials();
    } else {
      filterAudioMaterials();
    }
  }, [
    materials,
    audioMaterials,
    searchQuery,
    levelFilter,
    categoryFilter,
    bookTypeFilter,
    materialType,
  ]);

  const loadPDFMaterials = async () => {
    if (materialsLoaded) return;

    setLoading(true);
    try {
      const materialsData = isTeacher
        ? await getAllMaterials()
        : await getPublicMaterials();
      setMaterials(materialsData);
      setMaterialsLoaded(true);
    } catch (error) {
      console.error("[Materials] Error loading PDF materials:", error);
      toast.error("Failed to load PDF materials");
    } finally {
      setLoading(false);
    }
  };

  const loadAudioMaterials = async () => {
    if (audioMaterialsLoaded) return;

    setLoading(true);
    try {
      const audioData = isTeacher
        ? await getAllAudioMaterials()
        : await getPublicAudioMaterials();
      setAudioMaterials(audioData);
      setAudioMaterialsLoaded(true);
    } catch (error) {
      console.error("[Materials] Error loading audio materials:", error);
      toast.error("Failed to load audio materials");
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (levelFilter !== "All" && levelFilter !== "General") {
      filtered = filtered.filter((m) => m.level === levelFilter);
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    setFilteredMaterials(filtered);
  };

  const filterAudioMaterials = () => {
    let filtered = [...audioMaterials];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.fileName.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    if (levelFilter !== "All" && levelFilter !== "General") {
      filtered = filtered.filter((a) => a.level === levelFilter);
    }

    if (bookTypeFilter !== "All") {
      filtered = filtered.filter((a) => a.bookType === bookTypeFilter);
    }

    setFilteredAudioMaterials(filtered);
  };

  const handleDownload = async (material: Material) => {
    try {
      await incrementDownloadCount(material.materialId);
      window.open(material.filePath, "_blank");
      toast.success(`Opening ${material.title}`);
    } catch (error) {
      console.error("[Materials] Error downloading:", error);
      toast.error("Failed to open material");
    }
  };

  const handlePlayAudio = async (audio: AudioMaterial) => {
    try {
      if (currentlyPlaying === audio.audioId) {
        audioRef.current?.pause();
        setCurrentlyPlaying(null);
      } else {
        if (audioRef.current) {
          audioRef.current.src = getPlayableUrl(audio.fileUrl);
          try {
            await audioRef.current.play();
            setCurrentlyPlaying(audio.audioId);
            await incrementPlayCount(audio.audioId);
          } catch (playError) {
            console.error("[Materials] Playback error:", playError);
            const errorMessage =
              playError instanceof Error
                ? playError.message
                : String(playError);

            if (audio.hasBlob) {
              console.log("[Materials] Trying backup blob source...");
              try {
                audioRef.current.src = `/api/materials/audio/${audio.audioId}/blob`;
                await audioRef.current.play();
                setCurrentlyPlaying(audio.audioId);
                await incrementPlayCount(audio.audioId);
                toast.success("Playing from backup source", 2000);
                return;
              } catch (blobError) {
                console.error("[Materials] Blob playback error:", blobError);
              }
            }

            if (
              errorMessage.includes("not suitable") ||
              errorMessage.includes("CORS")
            ) {
              toast.error(
                "Audio cannot be played. Please enable public access and CORS on your R2 bucket.",
                5000,
                "Playback Error"
              );
            } else {
              toast.error("Failed to play audio file.", 3000, "Playback Error");
            }
            setCurrentlyPlaying(null);
          }
        }
      }
    } catch (error) {
      console.error("[Materials] Error handling audio:", error);
      toast.error("An unexpected error occurred", 3000);
    }
  };

  const handleToggleVisibility = async (material: Material) => {
    try {
      const newVisibility = !material.isPublic;
      await updateMaterialVisibility(material.materialId, newVisibility);

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
        subtitle="Schritte International textbooks, audio files, and supplementary materials"
        backButton={{
          label: "Back to Dashboard",
          href: "/dashboard",
        }}
      />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        onPause={() => setCurrentlyPlaying(null)}
      />

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Material Type Tabs */}
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMaterialType("audio")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                materialType === "audio"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎵 Audio Files ({audioMaterials.length})
            </button>
            <button
              onClick={() => setMaterialType("pdf")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                materialType === "pdf"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📄 PDF Files ({materials.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-neutral-200 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  materialType === "audio"
                    ? "Search audio files by title, filename, or description..."
                    : "Search PDF materials by title, description, or tags..."
                }
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
                  {LEVEL_OPTIONS.map((level) => (
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

              {/* Book Type Filter (only for Audio) */}
              {materialType === "audio" && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">
                    Filter by Book Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBookTypeFilter("All")}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        bookTypeFilter === "All"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setBookTypeFilter("KB")}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        bookTypeFilter === "KB"
                          ? "bg-purple-600 text-white"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      📖 Kursbuch
                    </button>
                    <button
                      onClick={() => setBookTypeFilter("AB")}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        bookTypeFilter === "AB"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      📝 Arbeitsbuch
                    </button>
                  </div>
                </div>
              )}

              {/* Category Filter (only for PDFs) */}
              {materialType === "pdf" && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">
                    Filter by Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((category) => (
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
              )}
            </div>

            {/* Results Count */}
            <div className="text-xs text-neutral-500">
              {materialType === "audio" ? (
                <>
                  Showing {filteredAudioMaterials.length} of{" "}
                  {audioMaterials.length} audio files
                </>
              ) : (
                <>
                  Showing {filteredMaterials.length} of {materials.length} PDF
                  materials
                </>
              )}
              {isTeacher && " (including private materials)"}
            </div>
          </div>
        </div>

        {/* Materials List */}
        {materialType === "audio" ? (
          <AudioMaterialsList
            materials={filteredAudioMaterials}
            currentlyPlaying={currentlyPlaying}
            onPlay={handlePlayAudio}
          />
        ) : (
          <PDFMaterialsList
            materials={filteredMaterials}
            onDownload={handleDownload}
            onToggleVisibility={handleToggleVisibility}
            isTeacher={isTeacher}
          />
        )}
      </div>
    </div>
  );
}
