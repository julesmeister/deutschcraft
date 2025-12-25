/**
 * Lesson Detail Page
 * Shows all exercises in a specific lesson
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { CategoryList } from '@/components/ui/CategoryList';
import { ExerciseFilters, FilterState } from '@/components/answer-hub/ExerciseFilters';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { useExercises } from '@/lib/hooks/useExercises';
import { useExerciseProgress } from '@/lib/hooks/useExerciseProgress';
import { CEFRLevel } from '@/lib/models/cefr';
import { Exercise } from '@/lib/models/exercises';

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

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userId } = getUserInfo(currentUser, session);

  // Parse URL params
  // Format: levelBook = "B1-AB", lessonId = "L1"
  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;

  // Parse level and book type from levelBook
  const [levelPart, bookType] = levelBook.split('-') as [string, 'AB' | 'KB'];
  const level = levelPart as CEFRLevel;

  // Parse lesson number from lessonId
  const lessonNumber = parseInt(lessonId.replace('L', ''));

  // Load exercises
  const { exerciseBook, lessons, isLoading, error } = useExercises(level, bookType);

  // Find the specific lesson
  const lesson = lessons.find(l => l.lessonNumber === lessonNumber);

  // Check if user is a teacher
  const isTeacher = currentUser?.role === 'teacher';

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: 'all',
    status: 'all',
    hasDiscussion: 'all',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Loading lesson..."
          backButton={{
            label: 'Back to Lessons',
            onClick: () => router.push('/dashboard/student/answer-hub'),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <CatLoader message="Loading lesson exercises..." size="md" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Lesson not found"
          backButton={{
            label: 'Back to Lessons',
            onClick: () => router.push('/dashboard/student/answer-hub'),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson Not Found</h3>
            <p className="text-gray-600 mb-4">
              {error || `Could not find Lektion ${lessonNumber} for ${level} ${bookType}`}
            </p>
            <Link
              href="/dashboard/student/answer-hub"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const exerciseCount = lesson.exercises.length;

  // Filter exercises based on filters
  const filteredExercises = useMemo(() => {
    return lesson.exercises.filter((exercise) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesNumber = exercise.exerciseNumber.toLowerCase().includes(searchLower);
        const matchesTitle = exercise.title?.toLowerCase().includes(searchLower);
        const matchesQuestion = exercise.question?.toLowerCase().includes(searchLower);
        if (!matchesNumber && !matchesTitle && !matchesQuestion) {
          return false;
        }
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && exercise.difficulty !== filters.difficulty) {
        return false;
      }

      // Status filter (requires progress data)
      if (filters.status !== 'all' && userId) {
        // We'll need to get progress for each exercise
        // This is handled in the rendering below
      }

      return true;
    });
  }, [lesson.exercises, filters, userId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title={`${lesson.title} - ${level} ${bookType}`}
        subtitle={`${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`}
        backButton={{
          label: 'Back to Lessons',
          onClick: () => router.push('/dashboard/student/answer-hub'),
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Filters */}
        {exerciseCount > 0 && (
          <div className="mb-6">
            <ExerciseFilters
              filters={filters}
              onFilterChange={setFilters}
              totalCount={exerciseCount}
              filteredCount={filteredExercises.length}
            />
          </div>
        )}

        {/* Exercises List */}
        {exerciseCount > 0 ? (
          filteredExercises.length > 0 ? (
            (() => {
              // Group exercises by section
              const exercisesBySection: Record<string, typeof lesson.exercises> = {};
              filteredExercises.forEach(ex => {
                const section = ex.section || 'Übungen';
                if (!exercisesBySection[section]) {
                  exercisesBySection[section] = [];
                }
                exercisesBySection[section].push(ex);
              });

            const sections = Object.keys(exercisesBySection);
            let colorIndex = 0;

            // Transform into CategoryList format
            const categories = sections.map((section) => {
              const items = exercisesBySection[section].map((exercise) => {
                const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
                colorIndex++;
                return (
                  <ExerciseListCard
                    key={exercise.exerciseId}
                    exercise={exercise}
                    levelBook={levelBook}
                    lessonId={lessonId}
                    colorScheme={colorScheme}
                  />
                );
              });

              return {
                key: section,
                header: section,
                items,
              };
            });

            return <CategoryList categories={categories} />;
          })()
        ) : (
          <div className="bg-white border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exercises Match Your Filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => setFilters({
                search: '',
                difficulty: 'all',
                status: 'all',
                hasDiscussion: 'all',
              })}
              className="inline-block px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )
      ) : (
          <div className="bg-white border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exercises Yet
            </h3>
            <p className="text-gray-600">
              Exercises for this lesson will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exercise List Card - Flat row style matching GrammarRuleCard
 */
function ExerciseListCard({
  exercise,
  levelBook,
  lessonId,
  colorScheme,
}: {
  exercise: Exercise;
  levelBook: string;
  lessonId: string;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
}) {
  // Construct exercise detail URL using exerciseId (unique identifier)
  const exerciseUrl = `/dashboard/student/answer-hub/${levelBook}/${lessonId}/${encodeURIComponent(exercise.exerciseId)}`;

  const answerCount = exercise.answers.length;

  return (
    <Link href={exerciseUrl}>
      <div className={`group ${colorScheme.bg} px-6 py-4 transition-all duration-200 cursor-pointer`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
              {exercise.exerciseNumber}
            </h3>
            <p className="text-sm text-gray-600 mb-0">
              {answerCount} item{answerCount !== 1 ? 's' : ''}
              {exercise.question && ` - ${exercise.question.substring(0, 60)}${exercise.question.length > 60 ? '...' : ''}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Answer Count Badge */}
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600">
              {answerCount}
            </span>

            {/* View Button */}
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 group-hover:text-white ${colorScheme.badge} transition-all duration-200`}
            >
              VIEW
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
