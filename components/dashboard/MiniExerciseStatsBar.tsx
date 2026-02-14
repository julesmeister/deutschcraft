"use client";

import { SRSStats } from "@/lib/services/writing/markedWordQuizService";
import { SRSStatsDisplay } from "./SRSStatsDisplay";

export interface SessionStats {
  points: number;
  accuracy: number;
}

interface MiniExerciseStatsBarProps {
  srsStats?: SRSStats | null;
  sessionStats?: SessionStats;
}

export function MiniExerciseStatsBar({
  srsStats,
  sessionStats,
}: MiniExerciseStatsBarProps) {
  if (!srsStats && !sessionStats) return null;

  return (
    <div className="mb-6 bg-gray-900 rounded-xl p-4">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Session Stats */}
        {sessionStats && (
          <div
            className={`flex items-center gap-6 ${
              srsStats
                ? "border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6 w-full md:w-auto justify-center md:justify-start"
                : "w-full justify-center"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white leading-none">
                {Math.round(sessionStats.accuracy)}%
              </div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                Accuracy
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-piku-mint leading-none">
                {sessionStats.points}
              </div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                Points
              </div>
            </div>
          </div>
        )}

        {/* SRS Stats */}
        {srsStats && (
          <div className="flex-1 w-full md:w-auto">
            <SRSStatsDisplay
              stats={srsStats}
              className="justify-center md:justify-end"
            />
          </div>
        )}
      </div>
    </div>
  );
}
