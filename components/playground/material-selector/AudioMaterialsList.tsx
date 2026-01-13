"use client";

import { type AudioMaterial } from "@/lib/services/turso/materialsService";

interface AudioMaterialsListProps {
  audioMaterials: AudioMaterial[];
  currentMaterialId?: string | null;
  onSelectMaterial: (audio: AudioMaterial) => void;
}

export function AudioMaterialsList({
  audioMaterials,
  currentMaterialId,
  onSelectMaterial,
}: AudioMaterialsListProps) {
  if (audioMaterials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">📭</div>
        <div className="text-sm">No audio files found</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {audioMaterials.map((audio) => (
        <div
          key={audio.audioId}
          className={`p-3 border transition-colors cursor-pointer ${
            currentMaterialId === audio.audioId
              ? "bg-blue-50 border-blue-500"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => onSelectMaterial(audio)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-neutral-900">
                🎵 {audio.title}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                {audio.fileName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-xs font-medium">
                  {audio.level}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium ${
                    audio.bookType === "KB"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {audio.bookType === "KB" ? "📖 Kursbuch" : "📝 Arbeitsbuch"}
                </span>
                {audio.trackNumber && (
                  <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium">
                    Track {audio.trackNumber}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  ▶ {audio.playCount} plays
                </span>
              </div>
            </div>
            {currentMaterialId === audio.audioId && (
              <div className="text-blue-500 text-xs font-medium">
                Currently Playing
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
