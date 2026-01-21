"use client";

import { useRouter } from "next/navigation";
import { RecentAnswerActivity } from "@/lib/hooks/useRecentLessonActivity";

interface RecentAnswerHubCardProps {
  activities: RecentAnswerActivity[];
  isLoading: boolean;
}

// Parse exercise ID to extract level, lesson, bookType
// Uses API data when available (for custom exercises), otherwise parses from exerciseId
function parseExerciseId(
  exerciseId: string,
  apiLevel?: string,
  apiLessonNumber?: number
) {
  let level = "";
  let lessonNumber = 0;
  let bookType = "AB";
  let shortName = "";

  // For custom exercises, prefer API data (from exercise_overrides table)
  if (exerciseId.startsWith("CUSTOM_")) {
    level = apiLevel?.toUpperCase() || "";
    lessonNumber = apiLessonNumber || 0;
    shortName = ""; // Will use exerciseTitle from DB
  } else {
    // Standard format: "B1.1-L1-AB-Folge1-1"
    const parts = exerciseId.split("-");

    // Level is first part (B1.1 -> B1)
    if (parts[0]) {
      const levelFull = parts[0];
      level = levelFull.includes(".") ? levelFull.split(".")[0] : levelFull;
    }

    // Lesson is second part (L1 -> 1)
    if (parts[1] && parts[1].toUpperCase().startsWith("L")) {
      lessonNumber = parseInt(parts[1].slice(1), 10) || 0;
    }

    // BookType is third part
    if (parts[2] && (parts[2] === "AB" || parts[2] === "KB")) {
      bookType = parts[2];
    }

    // Short name from section (4th part onwards)
    shortName = parts.slice(3, 5).join(" ") || "";
  }

  // Build URL
  const url = level && lessonNumber > 0
    ? `/dashboard/student/answer-hub/${level}-${bookType}/L${lessonNumber}`
    : "/dashboard/student/answer-hub";

  return { level, lessonNumber, bookType, shortName, url };
}

export function RecentAnswerHubCard({
  activities,
  isLoading,
}: RecentAnswerHubCardProps) {
  const router = useRouter();

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "now";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: "bg-emerald-100 text-emerald-700",
      A2: "bg-blue-100 text-blue-700",
      B1: "bg-purple-100 text-purple-700",
      B2: "bg-amber-100 text-amber-700",
      C1: "bg-pink-100 text-pink-700",
      C2: "bg-red-100 text-red-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-violet-600 text-sm font-bold uppercase">
          Recent Activity
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-violet-600 border-r-transparent"></div>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, idx) => {
            const parsed = parseExerciseId(
              activity.exerciseId,
              activity.level,
              activity.lessonNumber
            );
            return (
              <button
                key={`${activity.exerciseId}-${activity.itemNumber}-${idx}`}
                onClick={() => parsed.url && router.push(parsed.url)}
                className="w-full px-4 py-2 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {parsed.level && (
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded shrink-0 ${getLevelColor(parsed.level)}`}>
                      {parsed.level}
                    </span>
                  )}
                  <span className="text-xs text-gray-700 truncate">
                    {parsed.lessonNumber > 0 ? `L${parsed.lessonNumber}` : ""} {activity.exerciseTitle || parsed.shortName} #{activity.itemNumber}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {formatTimeAgo(activity.submittedAt)}
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-center py-6 px-4">
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-200">
        <button
          onClick={() => router.push("/dashboard/student/answer-hub")}
          className="w-full text-center text-xs font-bold uppercase text-gray-500 hover:text-gray-900 transition"
        >
          Answer Hub →
        </button>
      </div>
    </div>
  );
}
