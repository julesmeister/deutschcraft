'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui/StatCard';
import { StatGrid } from '@/components/ui/StatGrid';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

interface StudentData {
  email: string;
  name: string;
  currentLevel: string;
  studentId: string;
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
  const stats = useStudyStats(student?.email);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setIsLoading(true);

        // Fetch student data
        const studentRef = collection(db, 'users');
        const studentQuery = query(studentRef, where('email', '==', resolvedParams.studentId));
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0];
          setStudent({
            email: studentDoc.data().email,
            name: studentDoc.data().name || studentDoc.data().email,
            currentLevel: studentDoc.data().currentLevel || 'A1',
            studentId: studentDoc.id,
          });

          // Fetch recent sessions
          const progressRef = collection(db, 'progress');
          const progressQuery = query(
            progressRef,
            where('userId', '==', studentDoc.data().email),
            orderBy('date', 'desc'),
            limit(7)
          );
          const progressSnapshot = await getDocs(progressQuery);

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
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{student.name}</h1>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm uppercase">Date</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm uppercase">Cards Reviewed</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm uppercase">Accuracy</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm uppercase">Time Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {new Date(
                          session.date.slice(0, 4) + '-' +
                          session.date.slice(4, 6) + '-' +
                          session.date.slice(6, 8)
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {session.cardsReviewed}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          session.accuracy >= 80
                            ? 'bg-green-100 text-green-800'
                            : session.accuracy >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {session.timeSpent} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Learning Progress Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Learning Progress Breakdown</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Mastery Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-600">Mastered (70-100%)</span>
                    <span className="text-sm font-bold text-green-600">{stats.cardsLearned} cards</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalCards > 0 ? (stats.cardsLearned / stats.totalCards) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-600">In Progress (0-69%)</span>
                    <span className="text-sm font-bold text-blue-600">{stats.totalCards - stats.cardsLearned} cards</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalCards > 0 ? ((stats.totalCards - stats.cardsLearned) / stats.totalCards) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Study Consistency</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-piku-orange to-piku-gold rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Current Streak</p>
                    <p className="text-3xl font-black text-gray-900">{stats.streak} days</p>
                  </div>
                  <div className="text-5xl">🔥</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-piku-cyan to-piku-mint rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Overall Accuracy</p>
                    <p className="text-3xl font-black text-gray-900">{stats.accuracy}%</p>
                  </div>
                  <div className="text-5xl">🎯</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
