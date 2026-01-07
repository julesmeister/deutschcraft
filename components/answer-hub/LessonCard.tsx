/**
 * Lesson Card Component (Clickable)
 * Shows lesson overview with click to view exercises
 * Matches grammatik page design
 */

'use client';

import Link from 'next/link';
import { Lesson } from '@/lib/models/exercises';
import { CEFRLevel } from '@/lib/models/cefr';
import { useLessonProgress } from '@/lib/hooks/useExerciseProgress';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';

interface LessonCardProps {
  lesson: Lesson;
  level: CEFRLevel;
  bookType: 'AB' | 'KB';
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
    border: string;
  };
}

export function LessonCard({ lesson, level, bookType, colorScheme }: LessonCardProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userId } = getUserInfo(currentUser, session);

  const exerciseCount = lesson.exercises.length;
  const hasExercises = exerciseCount > 0;

  // Get lesson progress
  const progress = useLessonProgress(lesson, userId);

  // Construct URL for lesson detail page
  const lessonUrl = `/dashboard/student/answer-hub/${level}-${bookType}/L${lesson.lessonNumber}`;

  return (
    <Link href={lessonUrl}>
      <div className={`group ${colorScheme.bg} border-l-4 border-l-transparent px-6 py-4 transition-[background-color,border-color,padding] duration-300 ease-out cursor-pointer ${colorScheme.border} hover:pl-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-600 mb-0">
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
              {!hasExercises && ' (empty)'}
            </p>

            {/* Progress Bar - only show if there's progress */}
            {progress && progress.exercisesCompleted > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                <span className="font-medium">
                  {progress.exercisesCompleted} completed
                </span>
                <div className="flex-1 max-w-xs bg-gray-200 h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <span className="font-medium">{progress.percentage}%</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Progress Badge - shows completed/total */}
            {progress && progress.exercisesCompleted > 0 ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 transition-all duration-200">
                {progress.exercisesCompleted}/{exerciseCount}
              </span>
            ) : (
              /* Exercise Count Badge */
              exerciseCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 transition-all duration-200">
                  {exerciseCount}
                </span>
              )
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
