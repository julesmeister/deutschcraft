'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui/StatCard';
import { StatGrid } from '@/components/ui/StatGrid';
import { TabBar, TabItem } from '@/components/ui/TabBar';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, getUserFullName } from '@/lib/models/user';

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

interface StudentData {
  email: string;
  name: string;
  currentLevel: string;
}

interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get student's study stats
  const { stats } = useStudyStats(student?.email);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setIsLoading(true);

        // Decode the URL-encoded email
        const studentEmail = decodeURIComponent(resolvedParams.studentId);
        console.log('[StudentProfile] Loading student:', studentEmail);

        // Fetch student data - email is the document ID
        const studentDocRef = doc(db, 'users', studentEmail);
        const studentSnapshot = await getDoc(studentDocRef);

        if (studentSnapshot.exists()) {
          const userData = studentSnapshot.data() as User;
          console.log('[StudentProfile] Student data loaded:', userData);

          // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
          const displayName = (userData as any).name || getUserFullName(userData);

          setStudent({
            email: userData.email,
            name: displayName,
            currentLevel: userData.cefrLevel || 'A1',
          });

          // Fetch recent sessions
          const progressRef = collection(db, 'progress');
          const progressQuery = query(
            progressRef,
            where('userId', '==', userData.email),
            orderBy('date', 'desc'),
            limit(7)
          );
          const progressSnapshot = await getDocs(progressQuery);

          console.log('[StudentProfile] Recent sessions count:', progressSnapshot.docs.length);

          const sessions: RecentSession[] = progressSnapshot.docs.map(doc => {
            const data = doc.data();
            const total = (data.wordsCorrect || 0) + (data.wordsIncorrect || 0);
            const accuracy = total > 0 ? Math.round((data.wordsCorrect / total) * 100) : 0;

            return {
              date: data.date || doc.id.replace('PROG_', '').slice(0, 8),
              cardsReviewed: data.cardsReviewed || 0,
              accuracy,
              timeSpent: data.timeSpent || 0,
            };
          });

          setRecentSessions(sessions);
        } else {
          console.error('[StudentProfile] Student not found:', studentEmail);
        }
      } catch (error) {
        console.error('[StudentProfile] Error loading student data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (resolvedParams.studentId) {
      loadStudentData();
    }
  }, [resolvedParams.studentId]);

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
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <button
            onClick={() => router.push('/dashboard/teacher')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-piku-purple to-piku-cyan flex items-center justify-center text-3xl font-black text-white">
              {(student.name || student.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{student.name || 'Unknown Student'}</h1>
              <p className="text-gray-600 mt-1">Current Level: <span className="font-bold text-piku-purple">{student.currentLevel}</span></p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Study Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Study Statistics</h2>
          <StatGrid>
            <StatCard
              icon="📚"
              label="Total Cards"
              value={stats.totalCards.toString()}
              iconBgColor="bg-piku-purple-light"
            />
            <StatCard
              icon="✅"
              label="Cards Learned"
              value={stats.cardsLearned.toString()}
              subtitle="Mastery ≥ 70%"
              iconBgColor="bg-piku-mint"
            />
            <StatCard
              icon="🔥"
              label="Day Streak"
              value={stats.streak.toString()}
              subtitle="Consecutive days"
              iconBgColor="bg-piku-orange"
            />
            <StatCard
              icon="🎯"
              label="Accuracy"
              value={`${stats.accuracy}%`}
              subtitle="Overall correctness"
              iconBgColor="bg-piku-cyan"
            />
          </StatGrid>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Recent Sessions</h2>

          {recentSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold">No recent sessions</p>
              <p className="text-sm mt-2">This student hasn't practiced yet</p>
            </div>
          ) : (
            <ActivityTimeline
              items={recentSessions.map((session, index) => {
                const accuracyColor = session.accuracy >= 80 ? 'green' : session.accuracy >= 60 ? 'amber' : 'red';

                return {
                  id: `session-${index}`,
                  icon: <span className="text-white text-sm">📚</span>,
                  iconColor: 'bg-piku-purple',
                  title: new Date(
                    session.date.slice(0, 4) + '-' +
                    session.date.slice(4, 6) + '-' +
                    session.date.slice(6, 8)
                  ).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }),
                  description: `Reviewed ${session.cardsReviewed} cards in ${session.timeSpent} minutes`,
                  tags: [
                    {
                      label: `${session.accuracy}% Accuracy`,
                      color: accuracyColor,
                      icon: session.accuracy >= 80 ? '✓' : undefined,
                    },
                    {
                      label: `${session.cardsReviewed} cards`,
                      color: 'blue',
                    },
                    {
                      label: `${session.timeSpent} min`,
                      color: 'gray',
                    },
                  ],
                } as ActivityItem;
              })}
              showConnector={true}
            />
          )}
        </div>

        {/* Learning Progress Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Learning Progress</h2>

          <TabBar
            variant="stats"
            tabs={[
              {
                id: 'total',
                label: 'Total Cards',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                value: stats.totalCards.toLocaleString(),
              },
              {
                id: 'mastered',
                label: 'Cards Mastered',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                value: stats.cardsLearned.toLocaleString(),
              },
              {
                id: 'streak',
                label: 'Day Streak',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                ),
                value: `${stats.streak} days`,
              },
              {
                id: 'accuracy',
                label: 'Accuracy Rate',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                value: `${stats.accuracy}%`,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
