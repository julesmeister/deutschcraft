"use client";

import { useState, useEffect } from "react";
import { Label } from "../ui/Label";
import { ExerciseAttachment } from "@/lib/models/exercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { getAudioMaterialsByLevel, AudioMaterial } from "@/lib/services/turso/materialsService";
import { Music, X, ChevronDown, ChevronUp } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.log("[AudioAttachmentSelector] Component mounted with props:", {
      level,
      bookType,
      lessonNumber,
      attachmentsCount: attachments.length,
    });
    loadAudioMaterials();
  }, [level, bookType, lessonNumber]);

  const loadAudioMaterials = async () => {
    setLoading(true);
    try {
      console.log("[AudioAttachmentSelector] Loading audio for:", { level, bookType, lessonNumber });

      const levelStr = level as string;

      // Fetch all matching audio materials
      // If level is like "B1", we need to fetch both "B1.1" and "B1.2"
      let allMaterials: AudioMaterial[] = [];

      if (levelStr.includes(".")) {
        // Already specific (e.g., "B1.1")
        allMaterials = await getAudioMaterialsByLevel(levelStr, false);
      } else {
        // Base level (e.g., "B1"), fetch both sub-levels
        const subLevel1 = `${levelStr}.1`;
        const subLevel2 = `${levelStr}.2`;

        const [materials1, materials2] = await Promise.all([
          getAudioMaterialsByLevel(subLevel1, false).catch(() => []),
          getAudioMaterialsByLevel(subLevel2, false).catch(() => []),
        ]);

        allMaterials = [...materials1, ...materials2];
      }

      console.log("[AudioAttachmentSelector] Fetched materials:", allMaterials.length);

      // Filter by book type and lesson number
      const filtered = allMaterials.filter(
        (audio) =>
          audio.bookType === bookType &&
          audio.lessonNumber === lessonNumber
      );

      console.log("[AudioAttachmentSelector] Filtered materials:", filtered.length);
      setAudioMaterials(filtered);
    } catch (error) {
      console.error("[AudioAttachmentSelector] Error loading audio materials:", error);
      setAudioMaterials([]);
    } finally {
      setLoading(false);
    }
  };

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
                Hide audio library
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Browse {audioMaterials.length} audio files
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
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading audio files...
            </div>
          ) : audioMaterials.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No audio files found for {level} {bookType} Lesson {lessonNumber}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {audioMaterials.map((audio) => {
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
                      {audio.trackNumber && (
                        <p className="text-xs text-gray-500">
                          Track {audio.trackNumber}
                        </p>
                      )}
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
          No audio files available for this lesson
        </p>
      )}
    </div>
  );
}
