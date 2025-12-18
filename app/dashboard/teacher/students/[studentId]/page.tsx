'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FlashcardStatsSection } from '@/components/dashboard/FlashcardStatsSection';
import { WritingStatsSection } from '@/components/dashboard/WritingStatsSection';
import { GrammarStatsSection } from '@/components/dashboard/GrammarStatsSection';
import { RecentActivityTimeline } from '@/components/dashboard/RecentActivityTimeline';
import { CategoryProgressSection } from '@/components/dashboard/CategoryProgressSection';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { useWritingStats, useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import { useGrammarReviews } from '@/lib/hooks/useGrammarExercises';
import { useSessionPagination } from '@/lib/hooks/useSessionPagination';
import { useUserQuizzes } from '@/lib/hooks/useReviewQuizzes';
import { getUser } from '@/lib/services/userService';
import { getBatch } from '@/lib/services/batchService';
import { User, getUserFullName } from '@/lib/models/user';

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

interface StudentData {
  email: string;
  name: string;
  currentLevel: string;
  photoURL?: string;
  batchName?: string;
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'writing' | 'grammatik'>('flashcards');

  // Get student's study stats
  const { stats } = useStudyStats(student?.email);

  // Get student's writing stats
  const { data: writingStats } = useWritingStats(student?.email);
  const { data: rawWritingSubmissions = [] } = useStudentSubmissions(student?.email);
  const { data: userQuizzes = [] } = useUserQuizzes(student?.email);

  // Get student's grammar reviews
  const { reviews: grammarReviews } = useGrammarReviews(student?.email);

  // Normalize and combine writing submissions with quiz attempts
  const writingSubmissions = useMemo(() => {
    if (!rawWritingSubmissions || rawWritingSubmissions.length === 0) {
      return [];
    }

    // Serialize and deserialize to break all object references
    const serialized = JSON.parse(JSON.stringify(rawWritingSubmissions));

    return serialized.map((submission: any) => {
      // Normalize teacherScore
      if (submission.teacherScore && typeof submission.teacherScore === 'object') {
        submission.teacherScore = submission.teacherScore.overallScore || 0;
      }
      return submission;
    });
  }, [rawWritingSubmissions]);

  // Convert grammar reviews to activity items (grouped by date)
  const grammarSessions = useMemo(() => {
    if (!grammarReviews || grammarReviews.length === 0) return [];

    // Group reviews by date (lastReviewDate)
    const sessionsByDate = grammarReviews
      .filter(review => review.lastReviewDate)
      .reduce((acc, review) => {
        const dateKey = new Date(review.lastReviewDate!).toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(review);
        return acc;
      }, {} as Record<string, typeof grammarReviews>);

    // Convert to session objects
    return Object.entries(sessionsByDate).map(([dateKey, reviews]) => ({
      isGrammarSession: true,
      submissionId: `grammar-${dateKey}`,
      exerciseType: 'grammar' as const,
      status: 'reviewed' as const,
      sentenceCount: reviews.length,
      submittedAt: reviews[0].lastReviewDate!,
      updatedAt: reviews[0].lastReviewDate!,
      averageMastery: Math.round(
        reviews.reduce((sum, r) => sum + r.masteryLevel, 0) / reviews.length
      ),
      grammarReviews: reviews,
    }));
  }, [grammarReviews]);

  // Combine submissions, quizzes, and grammar sessions, sorted by date
  const combinedActivity = useMemo(() => {
    const items = [
      ...writingSubmissions,
      // Only include completed quizzes
      ...userQuizzes
        .filter(quiz => quiz.status === 'completed')
        .map(quiz => ({
          ...quiz,
          isQuiz: true,
          submissionId: quiz.quizId,
          exerciseType: 'quiz' as const,
          status: 'reviewed' as const,
          wordCount: quiz.totalBlanks,
          submittedAt: quiz.completedAt || quiz.startedAt,
          updatedAt: quiz.updatedAt,
        })),
      ...grammarSessions,
    ];

    // Sort by date (most recent first)
    return items.sort((a, b) => {
      const dateA = a.submittedAt || a.updatedAt || 0;
      const dateB = b.submittedAt || b.updatedAt || 0;
      return dateB - dateA;
    });
  }, [writingSubmissions, userQuizzes, grammarSessions]);

  // Pagination for flashcard sessions
  const sessionPagination = useSessionPagination(student?.email, 8);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setIsLoading(true);

        // Decode the URL-encoded email
        const studentEmail = decodeURIComponent(resolvedParams.studentId);

        // Fetch student data using service layer
        const userData = await getUser(studentEmail);

        if (userData) {
          // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
          const displayName = (userData as any).name || getUserFullName(userData);

          // Fetch batch information if student has a batchId
          let batchName: string | undefined = undefined;
          if (userData.batchId) {
            try {
              const batchData = await getBatch(userData.batchId);
              batchName = batchData?.name;
            } catch (error) {
              console.error('Error fetching batch data:', error);
            }
          }

          setStudent({
            email: userData.email,
            name: displayName,
            currentLevel: userData.cefrLevel || 'A1',
            photoURL: userData.photoURL,
            batchName,
          });
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (resolvedParams.studentId) {
      loadStudentData();
    }
  }, [resolvedParams.studentId]);

  // Fetch first page when student is loaded
  useEffect(() => {
    if (student?.email) {
      sessionPagination.fetchPage(1);
    }
  }, [student?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-red-200 rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">Could not load student data</p>
          <button
            onClick={() => router.push('/dashboard/teacher')}
            className="px-6 py-3 bg-piku-purple text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={student.name || 'Unknown Student'}
        subtitle={`Current Level: ${student.currentLevel}`}
        backButton={{
          label: 'Back to Dashboard',
          onClick: () => router.push('/dashboard/teacher'),
        }}
        avatar={{
          src: student.photoURL,
          initial: (student.name || student.email || '?').charAt(0).toUpperCase(),
          subtitle: student.batchName || student.email,
          subtitleAsBadge: !!student.batchName, // Show as badge only if it's a batch name
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Activity Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'flashcards'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Flashcards
            </button>
            <button
              onClick={() => setActiveTab('writing')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'writing'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✍️ Writing
            </button>
            <button
              onClick={() => setActiveTab('grammatik')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'grammatik'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📖 Grammatik
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          {activeTab === 'flashcards' ? (
            <FlashcardStatsSection stats={stats} />
          ) : activeTab === 'writing' ? (
            <WritingStatsSection writingStats={writingStats} studentEmail={student?.email} />
          ) : (
            <GrammarStatsSection studentEmail={student?.email} />
          )}
        </div>

        {/* Category Progress (only for flashcards tab) */}
        {activeTab === 'flashcards' && student?.email && (
          <div className="mb-8">
            <CategoryProgressSection userId={student.email} />
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            {activeTab === 'flashcards'
              ? 'Recent Flashcard Sessions'
              : activeTab === 'writing'
              ? 'Recent Writing Submissions'
              : 'Recent Grammar Practice Sessions'}
          </h2>

          <RecentActivityTimeline
            activeTab={activeTab}
            recentSessions={sessionPagination.sessions}
            writingSubmissions={combinedActivity}
            currentPage={sessionPagination.currentPage}
            onPageChange={sessionPagination.goToPage}
            isLoading={sessionPagination.isLoading}
            hasMore={sessionPagination.hasMore}
          />
        </div>
      </div>
    </div>
  );
}
