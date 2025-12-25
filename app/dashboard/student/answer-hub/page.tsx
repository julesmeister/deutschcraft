/**
 * Answer Hub Page
 * Batch-filtered exercise discussions for Schritte textbook
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CatLoader } from '@/components/ui/CatLoader';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { usePersistedLevel } from '@/lib/hooks/usePersistedLevel';
import { useExercises, useHasExercises } from '@/lib/hooks/useExercises';
import { CEFRLevel } from '@/lib/models/cefr';
import { BookTypeSelector } from '@/components/answer-hub/BookTypeSelector';
import { LessonCard } from '@/components/answer-hub/LessonCard';

export default function AnswerHubPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);

  // State
  const [selectedLevel, setSelectedLevel] = usePersistedLevel('answer-hub-last-level');
  const [selectedBookType, setSelectedBookType] = useState<'AB' | 'KB'>('AB');

  // Load exercises for selected level and book type
  const {
    exerciseBook,
    lessons,
    isLoading,
    error,
  } = useExercises(selectedLevel, selectedBookType);

  const hasExercises = useHasExercises(selectedLevel, selectedBookType);

  // Get current user's batch ID
  const currentUserBatchId = currentUser?.batchId;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Answer Hub 📝"
        subtitle="Practice Schritte exercises with your batch"
        backButton={{
          label: 'Back to Dashboard',
          onClick: () => router.push('/dashboard/student'),
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm rounded-xl mb-8 p-6 space-y-6">
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

          {/* Book Type Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Book Type
            </label>
            <BookTypeSelector
              selectedBookType={selectedBookType}
              onBookTypeChange={setSelectedBookType}
            />
          </div>

          {/* Info Box */}
          {currentUserBatchId ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                  <p className="font-semibold text-blue-900">Batch Privacy Active</p>
                  <p className="text-blue-700 mt-1">
                    You can only see discussions from your batch-mates. Share your
                    answers and help each other learn!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-amber-900">No Batch Assigned</p>
                  <p className="text-amber-700 mt-1">
                    You need to be assigned to a batch to participate in exercise
                    discussions. Contact your teacher.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <CatLoader message="Loading exercises..." size="md" />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Exercises</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* No Exercises State */}
        {!isLoading && !error && !hasExercises && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exercises Available
            </h3>
            <p className="text-gray-600 mb-4">
              Exercises for {selectedLevel} {selectedBookType} haven't been added yet.
            </p>
            <p className="text-sm text-gray-500">
              Try selecting a different level or book type.
            </p>
          </div>
        )}

        {/* Lessons List */}
        {!isLoading && !error && hasExercises && lessons.length > 0 && (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonNumber}
                lesson={lesson}
                level={selectedLevel}
                bookType={selectedBookType}
              />
            ))}
          </div>
        )}

        {/* Footer Info */}
        {!isLoading && hasExercises && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-neutral-700 max-w-2xl mx-auto">
                These are exercises from the Schritte International Neu textbook series.
                Use the correct answers to check your work, and discuss tricky questions
                with your batch-mates in the comments below each exercise.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
