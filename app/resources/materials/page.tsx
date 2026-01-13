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
type MaterialType = "pdf" | "audio";

export default function MaterialsPage() {
  const toast = useToast();
  const { session } = useFirebaseAuth();
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName, userRole } = getUserInfo(currentUser, session);

  const [loading, setLoading] = useState(true);
  const [materialType, setMaterialType] = useState<MaterialType>("audio");

  // PDF Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);

  // Audio Materials state
  const [audioMaterials, setAudioMaterials] = useState<AudioMaterial[]>([]);
  const [filteredAudioMaterials, setFilteredAudioMaterials] = useState<AudioMaterial[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("All");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("All");
  const [bookTypeFilter, setBookTypeFilter] = useState<"All" | "KB" | "AB">("All");

  const isTeacher = userRole === "teacher";

  useEffect(() => {
    if (userId) {
      loadAllMaterials();
    }
  }, [userId, isTeacher]);

  useEffect(() => {
    if (materialType === "pdf") {
      filterMaterials();
    } else {
      filterAudioMaterials();
    }
  }, [materials, audioMaterials, searchQuery, levelFilter, categoryFilter, bookTypeFilter, materialType]);

  const loadAllMaterials = async () => {
    setLoading(true);
    try {
      // Load PDFs
      const materialsData = isTeacher
        ? await getAllMaterials()
        : await getPublicMaterials();
      setMaterials(materialsData);

      // Load Audio
      const audioData = isTeacher
        ? await getAllAudioMaterials()
        : await getPublicAudioMaterials();
      setAudioMaterials(audioData);
    } catch (error) {
      console.error("[Materials] Error loading materials:", error);
      toast.error("Failed to load materials");
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
        // Pause if already playing
        audioRef.current?.pause();
        setCurrentlyPlaying(null);
      } else {
        // Play audio
        if (audioRef.current) {
          audioRef.current.src = audio.fileUrl;
          audioRef.current.play();
        }
        setCurrentlyPlaying(audio.audioId);
        await incrementPlayCount(audio.audioId);
      }
    } catch (error) {
      console.error("[Materials] Error playing audio:", error);
      toast.error("Failed to play audio");
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
            getCategoryIcon={getCategoryIcon}
            formatFileSize={formatFileSize}
          />
        )}
      </div>
    </div>
  );
}

// Audio Materials List Component
function AudioMaterialsList({
  materials,
  currentlyPlaying,
  onPlay,
}: {
  materials: AudioMaterial[];
  currentlyPlaying: string | null;
  onPlay: (audio: AudioMaterial) => void;
}) {
  // Extract lesson number from title/filename
  const extractLessonNumber = (text: string): number => {
    const match = text.match(/L(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Extract track number from end of filename or title
  const extractTrackNumber = (filenameOrTitle: string): number => {
    // Pattern: "301082 AB L01 1" or "301082_AB_L01_1.mp3"
    // We want the "1" at the very end

    // Remove .mp3 extension
    let text = filenameOrTitle.replace(/\.mp3$/i, '');

    // Split by spaces, underscores, or hyphens
    const parts = text.split(/[\s_-]+/);

    // Get the very last part
    const lastPart = parts[parts.length - 1];

    // Parse as integer (this will get "1" from "1", not "301082" from "301082_AB_L01_1")
    const trackNum = parseInt(lastPart, 10);

    // Return if it's a valid single or double digit number (1-99)
    if (!isNaN(trackNum) && trackNum > 0 && trackNum < 100) {
      return trackNum;
    }

    return 0;
  };

  // Group by level, then book type, then lesson
  const organized = materials.reduce((acc, audio) => {
    const level = audio.level;
    const bookType = audio.bookType;
    const lessonNum = extractLessonNumber(audio.title);

    if (!acc[level]) acc[level] = {};
    if (!acc[level][bookType]) acc[level][bookType] = {};
    if (!acc[level][bookType][lessonNum]) acc[level][bookType][lessonNum] = [];

    acc[level][bookType][lessonNum].push(audio);
    return acc;
  }, {} as Record<string, Record<string, Record<number, AudioMaterial[]>>>);

  // Sort tracks within each lesson
  Object.keys(organized).forEach(level => {
    Object.keys(organized[level]).forEach(bookType => {
      Object.keys(organized[level][bookType]).forEach(lessonNum => {
        organized[level][bookType][lessonNum].sort((a, b) => {
          const trackA = extractTrackNumber(a.fileName);
          const trackB = extractTrackNumber(b.fileName);
          return trackA - trackB;
        });
      });
    });
  });

  if (materials.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <div className="text-center py-12 text-neutral-400">
          <div className="text-4xl mb-2">🎵</div>
          <div className="text-sm">No audio files found</div>
          <div className="text-xs mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Levels sorted */}
      {Object.entries(organized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([level, bookTypes]) => (
          <div key={level} className="space-y-6">
            {/* Book Types (KB and AB) */}
            {Object.entries(bookTypes)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([bookType, lessons]) => {
                const totalTracks = Object.values(lessons).reduce((sum, tracks) => sum + tracks.length, 0);

                return (
                  <div key={bookType} className="bg-white border-2 border-neutral-200 shadow-md overflow-hidden">
                    {/* Book Type Header */}
                    <div className={`px-6 py-3 ${
                      bookType === 'KB'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-xl">{bookType === 'KB' ? '📖' : '📝'}</span>
                        {bookType === 'KB' ? 'Kursbuch' : 'Arbeitsbuch'}
                        <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                          {totalTracks} tracks
                        </span>
                      </h3>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y-2 divide-neutral-200">
                      {Object.entries(lessons)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([lessonNum, tracks]) => (
                          <div key={lessonNum}>
                            {/* Lesson Header */}
                            <div className="bg-neutral-100 px-6 py-2 border-b border-neutral-300">
                              <h4 className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                <span>📚</span>
                                Lektion {lessonNum}
                                <span className="text-xs text-neutral-500">
                                  ({tracks.length} {tracks.length === 1 ? 'track' : 'tracks'})
                                </span>
                              </h4>
                            </div>

                            {/* Tracks */}
                            <div className="divide-y divide-neutral-200">
                              {tracks.map((audio, index) => {
                                const isPlaying = currentlyPlaying === audio.audioId;
                                const trackNum = extractTrackNumber(audio.fileName);

                                return (
                                  <div
                                    key={audio.audioId}
                                    className={`group p-4 transition-all duration-200 ${
                                      isPlaying
                                        ? 'bg-blue-50 border-l-4 border-blue-500'
                                        : 'bg-white hover:bg-neutral-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      {/* Track Number */}
                                      <div className="flex-shrink-0 w-12 text-center">
                                        <span className={`text-sm font-bold ${
                                          isPlaying ? 'text-blue-600' : 'text-neutral-400'
                                        }`}>
                                          #{trackNum || index + 1}
                                        </span>
                                      </div>

                                      {/* Play Button */}
                                      <button
                                        onClick={() => onPlay(audio)}
                                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                          isPlaying
                                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        }`}
                                      >
                                        {isPlaying ? (
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                          </svg>
                                        ) : (
                                          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                        )}
                                      </button>

                                      {/* Audio Info */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm mb-1 truncate ${
                                          isPlaying ? 'text-blue-700' : 'text-neutral-900'
                                        }`}>
                                          {audio.title.split(' - ').slice(2).join(' - ')}
                                        </h4>

                                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                          {audio.cdNumber && (
                                            <span className="inline-flex items-center">
                                              <span className="mr-1">💿</span>
                                              {audio.cdNumber}
                                            </span>
                                          )}
                                          {audio.fileSize && (
                                            <span>
                                              {(audio.fileSize / (1024 * 1024)).toFixed(1)} MB
                                            </span>
                                          )}
                                          <span className="inline-flex items-center">
                                            <span className="mr-1">▶️</span>
                                            {audio.playCount}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Playing Indicator */}
                                      {isPlaying && (
                                        <div className="flex-shrink-0 flex gap-1 items-end h-8">
                                          <div className="w-1 bg-blue-500 rounded-full animate-wave" style={{ height: '40%', animationDelay: '0ms' }}></div>
                                          <div className="w-1 bg-blue-500 rounded-full animate-wave" style={{ height: '60%', animationDelay: '150ms' }}></div>
                                          <div className="w-1 bg-blue-500 rounded-full animate-wave" style={{ height: '80%', animationDelay: '300ms' }}></div>
                                          <div className="w-1 bg-blue-500 rounded-full animate-wave" style={{ height: '50%', animationDelay: '450ms' }}></div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
    </div>
  );
}

// PDF Materials List Component
function PDFMaterialsList({
  materials,
  onDownload,
  onToggleVisibility,
  isTeacher,
  getCategoryIcon,
  formatFileSize,
}: {
  materials: Material[];
  onDownload: (material: Material) => void;
  onToggleVisibility: (material: Material) => void;
  isTeacher: boolean;
  getCategoryIcon: (category: string) => string;
  formatFileSize: (bytes: number | null) => string;
}) {
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
          <div
            key={material.materialId}
            className="p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
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
        ))}
      </div>
    </div>
  );
}
