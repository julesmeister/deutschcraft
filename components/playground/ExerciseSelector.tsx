/**
 * Exercise Selector Component
 * Allows teachers to select exercises from the answer hub to display in playground
 */

"use client";

import { useState, useMemo } from "react";
import { ActionButtonIcons } from "@/components/ui/ActionButton";
import { useExercises } from "@/lib/hooks/useExercises";
import { CEFRLevel } from "@/lib/models/cefr";
import type { Exercise, Lesson } from "@/lib/models/exercises";

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (
    exerciseId: string,
    exerciseNumber: string,
    level: string,
    lessonNumber: number,
    bookType: "AB" | "KB"
  ) => Promise<void>;
  currentExerciseId?: string | null;
}

const AVAILABLE_LEVELS: CEFRLevel[] = [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2];
const BOOK_TYPES: ("AB" | "KB")[] = ["AB", "KB"];

export function ExerciseSelector({
  isOpen,
  onClose,
  onSelectExercise,
  currentExerciseId,
}: ExerciseSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.B1);
  const [selectedBookType, setSelectedBookType] = useState<"AB" | "KB">("AB");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);

  const { lessons, isLoading, error } = useExercises(selectedLevel, selectedBookType);

  // Filter exercises by search query
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;

    const query = searchQuery.toLowerCase();
    return lessons.map(lesson => ({
      ...lesson,
      exercises: lesson.exercises.filter(ex =>
        ex.exerciseNumber.toLowerCase().includes(query) ||
        ex.title?.toLowerCase().includes(query) ||
        ex.section?.toLowerCase().includes(query) ||
        ex.question?.toLowerCase().includes(query)
      )
    })).filter(lesson => lesson.exercises.length > 0);
  }, [lessons, searchQuery]);

  const handleSelectExercise = async (exercise: Exercise, lesson: Lesson) => {
    setIsSelecting(true);
    try {
      await onSelectExercise(
        exercise.exerciseId,
        exercise.exerciseNumber,
        selectedLevel,
        lesson.lessonNumber,
        selectedBookType
      );
      onClose();
    } catch (error) {
      console.error("[ExerciseSelector] Error selecting exercise:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 shadow-lg rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-neutral-900">
            Select Exercise to Display
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ActionButtonIcons.Close />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
          {/* Level and Book Type Selection */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Level
              </label>
              <div className="flex gap-1">
                {AVAILABLE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setSelectedLesson(null);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      selectedLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Book
              </label>
              <div className="flex gap-1">
                {BOOK_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedBookType(type);
                      setSelectedLesson(null);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      selectedBookType === type
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading exercises...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No exercises found for {selectedLevel} {selectedBookType}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLessons.map((lesson) => (
                <div key={lesson.lessonNumber} className="border-b border-gray-100">
                  {/* Lesson Header */}
                  <button
                    onClick={() => setSelectedLesson(
                      selectedLesson === lesson.lessonNumber ? null : lesson.lessonNumber
                    )}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {lesson.lessonNumber}
                      </span>
                      <span className="font-medium text-gray-900">
                        {lesson.title}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {lesson.exercises.length} exercises
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedLesson === lesson.lessonNumber ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Exercises List */}
                  {selectedLesson === lesson.lessonNumber && (
                    <div className="bg-gray-50 px-4 py-2">
                      <div className="grid gap-2">
                        {lesson.exercises.map((exercise) => (
                          <button
                            key={exercise.exerciseId}
                            onClick={() => handleSelectExercise(exercise, lesson)}
                            disabled={isSelecting}
                            className={`w-full p-3 text-left rounded-lg border transition-all ${
                              currentExerciseId === exercise.exerciseId
                                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                            } ${isSelecting ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">
                                    {exercise.exerciseNumber}
                                  </span>
                                  {exercise.section && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {exercise.section}
                                    </span>
                                  )}
                                  {currentExerciseId === exercise.exerciseId && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-medium">
                                      Currently Shown
                                    </span>
                                  )}
                                </div>
                                {exercise.title && exercise.title !== exercise.exerciseNumber && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {exercise.title}
                                  </p>
                                )}
                                {exercise.question && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {exercise.question}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-xs text-gray-400">
                                  {exercise.answers.length} items
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {filteredLessons.reduce((acc, l) => acc + l.exercises.length, 0)} exercises available
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
