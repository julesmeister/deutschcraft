/**
 * Answer Hub Page
 * Batch-filtered exercise discussions for Schritte textbook
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { CatLoader } from "@/components/ui/CatLoader";
import { CategoryList } from "@/components/ui/CategoryList";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { useExercisesWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { useHasExercises } from "@/lib/hooks/useExercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { LessonCard } from "@/components/answer-hub/LessonCard";

// Color schemes matching grammatik page
const CARD_COLOR_SCHEMES = [
  {
    bg: "hover:bg-blue-100",
    text: "group-hover:text-blue-900",
    badge: "group-hover:bg-blue-500",
  },
  {
    bg: "hover:bg-emerald-100",
    text: "group-hover:text-emerald-900",
    badge: "group-hover:bg-emerald-500",
  },
  {
    bg: "hover:bg-amber-100",
    text: "group-hover:text-amber-900",
    badge: "group-hover:bg-amber-500",
  },
  {
    bg: "hover:bg-purple-100",
    text: "group-hover:text-purple-900",
    badge: "group-hover:bg-purple-500",
  },
  {
    bg: "hover:bg-pink-100",
    text: "group-hover:text-pink-900",
    badge: "group-hover:bg-pink-500",
  },
];

export default function AnswerHubPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );

  // State
  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "answer-hub-last-level"
  );
  const selectedBookType = "AB"; // Fixed to Arbeitsbuch

  // Load exercises for selected level and book type (including teacher overrides)
  const { exerciseBook, lessons, isLoading, error } = useExercisesWithOverrides(
    selectedLevel,
    selectedBookType,
    undefined,
    session?.user?.email
  );

  const hasExercises = useHasExercises(selectedLevel, selectedBookType);

  // Get current user's batch ID
  const currentUserBatchId = currentUser?.batchId;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="animate-fade-in-up">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Practice Schritte exercises with your batch"
          backButton={{
            label: "Back to Dashboard",
            onClick: () => router.push("/dashboard/student"),
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-8 p-6 animate-slide-up animation-delay-100 transition-all duration-300">
          {/* Level Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              CEFR Level
            </label>
            <CEFRLevelSelector
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              size="md"
              showDescription={true}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="animate-fade-in-up">
            <CatLoader message="Loading exercises..." size="md" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white border border-red-200 shadow-sm p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Exercises
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* No Exercises State */}
        {!isLoading && !error && !hasExercises && (
          <div className="bg-white border border-gray-200 shadow-sm p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exercises Available
            </h3>
            <p className="text-gray-600 mb-4">
              Exercises for {selectedLevel} {selectedBookType} haven't been
              added yet.
            </p>
            <p className="text-sm text-gray-500">
              Try selecting a different level.
            </p>
          </div>
        )}

        {/* Lessons List */}
        {!isLoading && !error && hasExercises && lessons.length > 0 && (
          <div className="animate-fade-in-up animation-delay-200">
            <CategoryList
              categories={[
                {
                  key: `${selectedLevel}-${selectedBookType}`,
                  header: `Schritte International Neu - ${selectedLevel}`,
                  items: lessons.map((lesson, index) => {
                    const colorScheme =
                      CARD_COLOR_SCHEMES[index % CARD_COLOR_SCHEMES.length];
                    return (
                      <LessonCard
                        key={lesson.lessonNumber}
                        lesson={lesson}
                        level={selectedLevel}
                        bookType={selectedBookType}
                        colorScheme={colorScheme}
                      />
                    );
                  }),
                },
              ]}
            />
          </div>
        )}

        {/* Footer Info */}
        {!isLoading && hasExercises && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 animate-slide-up animation-delay-300 transition-all duration-300 hover:shadow-md">
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-neutral-700 max-w-2xl mx-auto">
                These are exercises from the Schritte International Neu textbook
                series. Use the correct answers to check your work, and discuss
                tricky questions with your batch-mates in the comments below
                each exercise.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
