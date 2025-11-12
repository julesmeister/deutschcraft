'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FlashcardStatsSection } from '@/components/dashboard/FlashcardStatsSection';
import { WritingStatsSection } from '@/components/dashboard/WritingStatsSection';
import { RecentActivityTimeline } from '@/components/dashboard/RecentActivityTimeline';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { useWritingStats, useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import { useSessionPagination } from '@/lib/hooks/useSessionPagination';
import { getUser } from '@/lib/services/userService';
import { User, getUserFullName } from '@/lib/models/user';

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

interface StudentData {
  email: string;
  name: string;
  currentLevel: string;
  photoURL?: string;
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'writing'>('flashcards');

  // Get student's study stats
  const { stats } = useStudyStats(student?.email);

  // Get student's writing stats
  const { data: writingStats } = useWritingStats(student?.email);
  const { data: writingSubmissions = [] } = useStudentSubmissions(student?.email);

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

          setStudent({
            email: userData.email,
            name: displayName,
            currentLevel: userData.cefrLevel || 'A1',
            photoURL: userData.photoURL,
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
          subtitle: student.email,
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
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          {activeTab === 'flashcards' ? (
            <FlashcardStatsSection stats={stats} />
          ) : (
            <WritingStatsSection writingStats={writingStats} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            {activeTab === 'flashcards' ? 'Recent Flashcard Sessions' : 'Recent Writing Submissions'}
          </h2>

          <RecentActivityTimeline
            activeTab={activeTab}
            recentSessions={sessionPagination.sessions}
            writingSubmissions={writingSubmissions}
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
