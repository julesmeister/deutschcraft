"use client";

import { useState, useEffect } from "react";
import { Label } from "../ui/Label";
import { ExerciseAttachment } from "@/lib/models/exercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { getAllAudioMaterials, AudioMaterial } from "@/lib/services/turso/materialsService";
import { Music, X, ChevronDown, ChevronUp, Search } from "lucide-react";

interface AudioAttachmentSelectorProps {
  level: CEFRLevel;
  bookType: "AB" | "KB";
  lessonNumber: number;
  attachments: ExerciseAttachment[];
  onAttachmentsChange: (attachments: ExerciseAttachment[]) => void;
}

export function AudioAttachmentSelector({
  level,
  bookType,
  lessonNumber,
  attachments,
  onAttachmentsChange,
}: AudioAttachmentSelectorProps) {
  const [audioMaterials, setAudioMaterials] = useState<AudioMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<AudioMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [bookTypeFilter, setBookTypeFilter] = useState<string>("All");
  const [lessonFilter, setLessonFilter] = useState<string>("All");

  useEffect(() => {
    console.log("[AudioAttachmentSelector] Component mounted");
    loadAudioMaterials();
  }, []);

  const loadAudioMaterials = async () => {
    setLoading(true);
    try {
      // Load ALL audio materials (no filtering by level/book/lesson)
      const allMaterials = await getAllAudioMaterials();
      console.log("[AudioAttachmentSelector] Loaded all audio materials:", allMaterials.length);

      setAudioMaterials(allMaterials);
      setFilteredMaterials(allMaterials);
    } catch (error) {
      console.error("[AudioAttachmentSelector] Error loading audio materials:", error);
      setAudioMaterials([]);
      setFilteredMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter materials based on search query and filters
  useEffect(() => {
    let filtered = [...audioMaterials];

    // Apply level filter
    if (levelFilter !== "All") {
      filtered = filtered.filter((audio) => audio.level === levelFilter);
    }

    // Apply book type filter
    if (bookTypeFilter !== "All") {
      filtered = filtered.filter((audio) => audio.bookType === bookTypeFilter);
    }

    // Apply lesson filter
    if (lessonFilter !== "All") {
      filtered = filtered.filter(
        (audio) => audio.lessonNumber === parseInt(lessonFilter)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (audio) =>
          audio.title.toLowerCase().includes(query) ||
          audio.fileName.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [searchQuery, audioMaterials, levelFilter, bookTypeFilter, lessonFilter]);

  // Extract unique values for filters
  const uniqueLevels = Array.from(
    new Set(audioMaterials.map((a) => a.level))
  ).sort();
  const uniqueLessons = Array.from(
    new Set(
      audioMaterials
        .map((a) => a.lessonNumber)
        .filter((l): l is number => l !== null)
    )
  ).sort((a, b) => a - b);

  const handleAddAudio = (audio: AudioMaterial) => {
    // Check if already added
    if (attachments.some((att) => att.audioId === audio.audioId)) {
      return;
    }

    const newAttachment: ExerciseAttachment = {
      type: "audio",
      url: audio.fileUrl,
      title: audio.title,
      audioId: audio.audioId,
    };

    onAttachmentsChange([...attachments, newAttachment]);
  };

  const handleRemoveAudio = (audioId: string) => {
    onAttachmentsChange(attachments.filter((att) => att.audioId !== audioId));
  };

  const audioAttachments = attachments.filter((att) => att.type === "audio");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-gray-700">
          🎵 Audio Attachments (Optional)
        </Label>
        {audioMaterials.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide library
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Browse all {audioMaterials.length} audio files
              </>
            )}
          </button>
        )}
      </div>

      {/* Current attachments */}
      {audioAttachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Selected audio files ({audioAttachments.length}):
          </p>
          {audioAttachments.map((attachment) => (
            <div
              key={attachment.audioId}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <Music className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAudio(attachment.audioId!)}
                className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Audio library (collapsible) */}
      {expanded && (
        <div className="mt-3 border border-gray-200 rounded-lg">
          {/* Search and filters */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-3">
            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or filename..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-2">
              {/* Level filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Levels</option>
                {uniqueLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>

              {/* Book type filter */}
              <select
                value={bookTypeFilter}
                onChange={(e) => setBookTypeFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Books</option>
                <option value="KB">Kursbuch</option>
                <option value="AB">Arbeitsbuch</option>
              </select>

              {/* Lesson filter */}
              <select
                value={lessonFilter}
                onChange={(e) => setLessonFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Lessons</option>
                {uniqueLessons.map((lesson) => (
                  <option key={lesson} value={lesson.toString()}>
                    Lesson {lesson}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-500">
              Showing {filteredMaterials.length} of {audioMaterials.length} audio files
            </p>
          </div>

          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading audio files...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery
                ? `No audio files match "${searchQuery}"`
                : "No audio files available"}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {filteredMaterials.map((audio) => {
                const isSelected = audioAttachments.some(
                  (att) => att.audioId === audio.audioId
                );

                return (
                  <button
                    key={audio.audioId}
                    type="button"
                    onClick={() => handleAddAudio(audio)}
                    disabled={isSelected}
                    className={`w-full flex items-center gap-3 p-3 text-left border-b border-gray-200 last:border-b-0 transition-colors ${
                      isSelected
                        ? "bg-gray-100 cursor-not-allowed opacity-60"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {/* Track number - LEFT SIDE */}
                    {audio.trackNumber && (
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                          {audio.trackNumber}
                        </span>
                      </div>
                    )}

                    <Music
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? "text-gray-400" : "text-blue-600"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {audio.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">
                          {audio.level}
                        </span>
                        <span>•</span>
                        <span className={audio.bookType === "KB" ? "text-purple-600" : "text-green-600"}>
                          {audio.bookType === "KB" ? "Kursbuch" : "Arbeitsbuch"}
                        </span>
                        {audio.lessonNumber && (
                          <>
                            <span>•</span>
                            <span>L{audio.lessonNumber}</span>
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

      {!expanded && audioMaterials.length === 0 && !loading && (
        <p className="text-xs text-gray-500">
          No audio files available in the library
        </p>
      )}
    </div>
  );
}
