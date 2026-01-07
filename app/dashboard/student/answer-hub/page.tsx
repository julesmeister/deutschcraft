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
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Practice Schritte exercises with your batch"
          backButton={{
            label: "Back to Dashboard",
            onClick: () => router.push("/dashboard/student"),
          }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-sm mb-8 p-6"
        >
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
        </motion.div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 min-h-[400px]"
            >
              <CatLoader message="Loading exercises..." size="md" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-red-200 shadow-sm p-12 text-center"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Error Loading Exercises
              </h3>
              <p className="text-gray-600">{error}</p>
            </motion.div>
          ) : !hasExercises ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 shadow-sm p-12 text-center"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Lessons List */}
              {lessons.length > 0 && (
                <div className="mb-8">
                  <CategoryList
                    categories={[
                      {
                        key: `${selectedLevel}-${selectedBookType}`,
                        header: `Schritte International Neu - ${selectedLevel}`,
                        items: lessons.map((lesson, index) => {
                          const colorScheme =
                            CARD_COLOR_SCHEMES[
                              index % CARD_COLOR_SCHEMES.length
                            ];
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
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 transition-all duration-300 hover:shadow-md">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-sm text-neutral-700 max-w-2xl mx-auto">
                    These are exercises from the Schritte International Neu
                    textbook series. Use the correct answers to check your work,
                    and discuss tricky questions with your batch-mates in the
                    comments below each exercise.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
