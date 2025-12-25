/**
 * Lesson Card Component (Clickable)
 * Shows lesson overview with click to view exercises
 */

'use client';

import Link from 'next/link';
import { Lesson } from '@/lib/models/exercises';
import { CEFRLevel } from '@/lib/models/cefr';

interface LessonCardProps {
  lesson: Lesson;
  level: CEFRLevel;
  bookType: 'AB' | 'KB';
}

export function LessonCard({ lesson, level, bookType }: LessonCardProps) {
  const exerciseCount = lesson.exercises.length;
  const hasExercises = exerciseCount > 0;

  // Construct URL for lesson detail page
  const lessonUrl = `/dashboard/student/answer-hub/${level}-${bookType}/L${lesson.lessonNumber}`;

  return (
    <Link href={lessonUrl}>
      <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden cursor-pointer">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
          <div className="flex items-center gap-4">
            {/* Lesson Number Badge */}
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center transition-colors duration-200">
              <span className="text-white font-black text-xl">
                {lesson.lessonNumber}
              </span>
            </div>

            {/* Lesson Info */}
            <div className="text-left">
              <h2 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                {lesson.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                {!hasExercises && ' (empty)'}
              </p>
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex items-center gap-3">
            {hasExercises && (
              <span className="hidden sm:block text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-300 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200">
                View Exercises
              </span>
            )}
            <svg
              className="w-6 h-6 text-gray-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Quick Preview Footer */}
        {hasExercises && (
          <div className="px-6 py-3 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Click to view all exercises and discuss with your batch
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
