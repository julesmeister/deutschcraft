/**
 * Lesson Section Component
 * Collapsible container for exercises in a lesson
 */

'use client';

import { useState } from 'react';
import { Lesson } from '@/lib/models/exercises';
import { User } from '@/lib/models/user';
import { ExerciseCard } from './ExerciseCard';

interface LessonSectionProps {
  lesson: Lesson;
  currentUser: User | null;
  currentUserBatchId: string | null | undefined;
  defaultExpanded?: boolean;
}

// Color schemes for exercise cards (rotate through these)
const CARD_COLOR_SCHEMES = [
  { bg: 'hover:bg-blue-50', badge: 'bg-blue-500' },
  { bg: 'hover:bg-emerald-50', badge: 'bg-emerald-500' },
  { bg: 'hover:bg-amber-50', badge: 'bg-amber-500' },
  { bg: 'hover:bg-purple-50', badge: 'bg-purple-500' },
  { bg: 'hover:bg-pink-50', badge: 'bg-pink-500' },
];

export function LessonSection({
  lesson,
  currentUser,
  currentUserBatchId,
  defaultExpanded = false,
}: LessonSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const exerciseCount = lesson.exercises.length;
  const hasExercises = exerciseCount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Lesson Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 hover:from-gray-100 hover:to-gray-150 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {/* Lesson Number Badge */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">
              {lesson.lessonNumber}
            </span>
          </div>

          {/* Lesson Title */}
          <div className="text-left">
            <h2 className="text-lg font-black text-gray-900">
              {lesson.title}
            </h2>
            <p className="text-sm text-gray-600">
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="flex items-center gap-3">
          {hasExercises && (
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-300">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
          )}
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Lesson Body (Collapsible) */}
      {isExpanded && (
        <div className="p-6">
          {hasExercises ? (
            <div className="grid grid-cols-1 gap-4">
              {lesson.exercises.map((exercise, index) => {
                const colorScheme = CARD_COLOR_SCHEMES[index % CARD_COLOR_SCHEMES.length];
                return (
                  <ExerciseCard
                    key={exercise.exerciseId}
                    exercise={exercise}
                    currentUser={currentUser}
                    currentUserBatchId={currentUserBatchId}
                    colorScheme={colorScheme}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No exercises yet
              </h3>
              <p className="text-sm text-gray-600">
                Exercises for this lesson will be added soon.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
