/**
 * Lesson Detail Page
 * Shows all exercises in a specific lesson
 */

'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useExercises } from '@/lib/hooks/useExercises';
import { CEFRLevel } from '@/lib/models/cefr';
import { Exercise } from '@/lib/models/exercises';

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);

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
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Select an Exercise</p>
              <p className="text-blue-700 mt-1">
                Click on any exercise below to view details, {isTeacher ? 'see correct answers,' : 'submit your answers,'} and discuss
                with your batch-mates.
              </p>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        {exerciseCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.exercises.map((exercise) => (
              <ExerciseListCard
                key={exercise.exerciseId}
                exercise={exercise}
                levelBook={levelBook}
                lessonId={lessonId}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
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
 * Exercise List Card - Clickable card that navigates to exercise detail
 */
function ExerciseListCard({
  exercise,
  levelBook,
  lessonId,
}: {
  exercise: Exercise;
  levelBook: string;
  lessonId: string;
}) {
  // Construct exercise detail URL
  const exerciseUrl = `/dashboard/student/answer-hub/${levelBook}/${lessonId}/${exercise.exerciseNumber}`;

  const answerCount = exercise.answers.length;

  // Difficulty colors
  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
  };

  const difficultyColor = exercise.difficulty
    ? difficultyColors[exercise.difficulty]
    : difficultyColors.medium;

  return (
    <Link href={exerciseUrl}>
      <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 p-5 cursor-pointer">
        {/* Exercise Number Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center transition-colors duration-200">
            <span className="text-white font-black text-sm">
              {exercise.exerciseNumber}
            </span>
          </div>

          {/* Difficulty Badge */}
          {exercise.difficulty && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${difficultyColor}`}
            >
              {exercise.difficulty}
            </span>
          )}
        </div>

        {/* Exercise Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 mb-2">
          {exercise.title}
        </h3>

        {/* Question Preview */}
        {exercise.question && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {exercise.question}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{answerCount} items</span>
          </div>

          {exercise.topic && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
              {exercise.topic}
            </span>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
          <span>View Exercise</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
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
    </Link>
  );
}
