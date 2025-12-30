'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { useLessonWithOverrides } from '@/lib/hooks/useExercisesWithOverrides';
import { useStudentLessonAnswers } from '@/lib/hooks/useStudentAnswers';
import { CEFRLevel } from '@/lib/models/cefr';

export default function LessonSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userId } = getUserInfo(currentUser, session);

  // Parse URL params
  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;
  const [levelPart, bookType] = levelBook.split('-') as [string, 'AB' | 'KB'];
  const level = levelPart as CEFRLevel;
  const lessonNumber = parseInt(lessonId.replace('L', ''));

  // Fetch lesson data
  const { lesson, isLoading: isLessonLoading } = useLessonWithOverrides(
    level,
    bookType,
    lessonNumber,
    session?.user?.email || null
  );

  // Get all exercise IDs in this lesson
  const exerciseIds = useMemo(() => 
    lesson?.exercises.map(e => e.exerciseId) || [], 
    [lesson]
  );

  // Fetch all student answers for these exercises
  const { answers, isLoading: isAnswersLoading } = useStudentLessonAnswers(userId, exerciseIds);

  // Group answers by exerciseId
  const answersByExercise = useMemo(() => {
    const map = new Map<string, typeof answers>();
    answers.forEach(a => {
        if (!map.has(a.exerciseId)) map.set(a.exerciseId, []);
        map.get(a.exerciseId)?.push(a);
    });
    return map;
  }, [answers]);

  // Filter exercises to only those with at least one answer
  const attemptedExercises = useMemo(() => 
    lesson?.exercises.filter(ex => answersByExercise.has(ex.exerciseId)) || [],
    [lesson, answersByExercise]
  );

  if (isLessonLoading || isAnswersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Lesson Summary"
          subtitle="Loading answers..."
          backButton={{
            label: 'Back to Lesson',
            onClick: () => router.push(`/dashboard/student/answer-hub/${levelBook}/${lessonId}`),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <CatLoader message="Loading your answers..." size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader 
        title={`${lesson?.title || 'Lesson'} - Summary`}
        subtitle={`Your answers for ${level} ${bookType} Lektion ${lessonNumber}`}
        backButton={{
            label: 'Back to Lesson',
            onClick: () => router.push(`/dashboard/student/answer-hub/${levelBook}/${lessonId}`)
        }}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {attemptedExercises.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Answers Yet</h3>
                <p className="text-gray-600 mb-6">
                    You haven't submitted any answers for this lesson yet.
                </p>
                <button
                    onClick={() => router.push(`/dashboard/student/answer-hub/${levelBook}/${lessonId}`)}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Start Practicing
                </button>
            </div>
        ) : (
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                        {attemptedExercises.length} Exercise{attemptedExercises.length !== 1 ? 's' : ''} Attempted
                    </h2>
                    <span className="text-sm text-gray-500">
                        Total Answers: {answers.length}
                    </span>
                </div>

                {attemptedExercises.map(ex => {
                    const exAnswers = answersByExercise.get(ex.exerciseId) || [];
                    // Sort answers by item number
                    exAnswers.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true }));
                    
                    return (
                        <div key={ex.exerciseId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                                            {ex.exerciseNumber}
                                        </span>
                                        <h3 className="font-bold text-gray-900">{ex.title}</h3>
                                    </div>
                                    {ex.question && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ex.question}</p>
                                    )}
                                </div>
                                <Link 
                                    href={`/dashboard/student/answer-hub/${levelBook}/${lessonId}/${encodeURIComponent(ex.exerciseId)}`}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
                                >
                                    Edit Answers
                                </Link>
                            </div>
                            
                            <div className="divide-y divide-gray-100">
                                {exAnswers.map(ans => (
                                    <div key={ans.itemNumber} className="px-6 py-3 flex gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="font-mono text-sm font-semibold text-gray-500 w-8 pt-0.5">
                                            {ans.itemNumber}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-gray-900 font-medium">{ans.studentAnswer}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(ans.submittedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
