"use client";

import { Plus } from "lucide-react";

interface LessonEmptyStateProps {
  type: "no-exercises" | "no-matches";
  isTeacher?: boolean;
  onCreateExercise?: () => void;
  onClearFilters?: () => void;
}

export function LessonEmptyState({ 
  type, 
  isTeacher, 
  onCreateExercise, 
  onClearFilters 
}: LessonEmptyStateProps) {
  if (type === "no-matches") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center animate-scale-in">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No Exercises Match Your Filters
        </h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search or filter criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center animate-scale-in">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No Exercises Yet
      </h3>
      <p className="text-gray-600 mb-4">
        {isTeacher
          ? "Get started by creating your first custom exercise!"
          : "Exercises for this lesson will be added soon."}
      </p>
      {isTeacher && onCreateExercise && (
        <button
          onClick={onCreateExercise}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Exercise
        </button>
      )}
    </div>
  );
}
