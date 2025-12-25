/**
 * Lesson Card Component (Clickable)
 * Shows lesson overview with click to view exercises
 * Matches grammatik page design
 */

'use client';

import Link from 'next/link';
import { Lesson } from '@/lib/models/exercises';
import { CEFRLevel } from '@/lib/models/cefr';

interface LessonCardProps {
  lesson: Lesson;
  level: CEFRLevel;
  bookType: 'AB' | 'KB';
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
}

export function LessonCard({ lesson, level, bookType, colorScheme }: LessonCardProps) {
  const exerciseCount = lesson.exercises.length;
  const hasExercises = exerciseCount > 0;

  // Construct URL for lesson detail page
  const lessonUrl = `/dashboard/student/answer-hub/${level}-${bookType}/L${lesson.lessonNumber}`;

  return (
    <Link href={lessonUrl}>
      <div className={`group ${colorScheme.bg} px-6 py-4 transition-all duration-200 cursor-pointer`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-600 mb-0">
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
              {!hasExercises && ' (empty)'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Exercise Count Badge */}
            {exerciseCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600">
                {exerciseCount}
              </span>
            )}

            {/* View Button */}
            <button
              className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 group-hover:text-white ${colorScheme.badge} transition-all duration-200`}
            >
              VIEW
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
