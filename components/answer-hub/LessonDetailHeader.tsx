/**
 * Lesson Detail Header Component
 * Displays lesson title, exercise count, and hidden exercises info
 */

"use client";

import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BatchSelector } from "@/components/ui/BatchSelector";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { Batch } from "@/lib/models";
import { CEFRLevel } from "@/lib/models/cefr";

interface LessonDetailHeaderProps {
  lessonTitle: string;
  level: CEFRLevel;
  bookType: "AB" | "KB";
  exerciseCount: number;
  isTeacher: boolean;
  hiddenExercisesCount: number;
  batches: Batch[];
  selectedBatch: Batch | null;
  onOpenHiddenModal: () => void;
  onSelectBatch: (batch: Batch | null) => void;
  onCreateBatch: () => void;
  onViewSummary?: () => void;
  onRefresh?: () => void;
}

export function LessonDetailHeader({
  lessonTitle,
  level,
  bookType,
  exerciseCount,
  isTeacher,
  hiddenExercisesCount,
  batches,
  selectedBatch,
  onOpenHiddenModal,
  onSelectBatch,
  onCreateBatch,
  onViewSummary,
  onRefresh,
}: LessonDetailHeaderProps) {
  const router = useRouter();

  return (
    <DashboardHeader
      title={`${lessonTitle} - ${level} ${bookType}`}
      subtitle={
        <>
          {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
          {isTeacher && hiddenExercisesCount > 0 && (
            <>
              {" • "}
              <button
                onClick={onOpenHiddenModal}
                className="text-gray-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5 align-middle"
              >
                <EyeOff className="w-4 h-4" />
                <span>{hiddenExercisesCount} hidden</span>
              </button>
            </>
          )}
        </>
      }
      backButton={{
        label: "Back to Lessons",
        onClick: () => router.push("/dashboard/student/answer-hub"),
      }}
      actions={
        <div className="flex items-center gap-3">
          {onViewSummary && (
            <>
              <div className="w-auto">
                <ActionButton
                  onClick={onViewSummary}
                  variant="purple"
                  size="default"
                  icon={<ActionButtonIcons.Document />}
                >
                  View Summary
                </ActionButton>
              </div>
              {onRefresh && (
                <div className="w-auto">
                  <ActionButton
                    onClick={onRefresh}
                    variant="default"
                    size="default"
                    icon={<ActionButtonIcons.Refresh />}
                  >
                    Refresh
                  </ActionButton>
                </div>
              )}
            </>
          )}
          {isTeacher && (
            <BatchSelector
              batches={batches}
              selectedBatch={selectedBatch}
              onSelectBatch={onSelectBatch}
              onCreateBatch={onCreateBatch}
            />
          )}
        </div>
      }
    />
  );
}
