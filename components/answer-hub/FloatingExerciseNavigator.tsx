
"use client";

import { useMemo } from "react";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";

interface FloatingExerciseNavigatorProps {
  exercises: ExerciseWithOverrideMetadata[];
  onScrollToExercise: (exerciseId: string, index: number) => void;
}

export function FloatingExerciseNavigator({
  exercises,
  onScrollToExercise,
}: FloatingExerciseNavigatorProps) {
  if (exercises.length === 0) return null;

  return (
    <div className="fixed right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 hidden lg:flex flex-col gap-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {exercises.map((ex, idx) => (
        <button
          key={`nav-${ex.exerciseId}-${idx}`}
          onClick={() => onScrollToExercise(ex.exerciseId, idx)}
          className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
          title={ex.title}
        >
          {ex.exerciseNumber}
        </button>
      ))}
    </div>
  );
}
