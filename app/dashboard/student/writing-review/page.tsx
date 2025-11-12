'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { Badge } from '@/components/ui/Badge';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { WritingExerciseType } from '@/lib/models/writing';
import { TRANSLATION_EXERCISES } from '@/lib/data/translations';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES } from '@/lib/data/letterTemplates';

type FilterType = 'all' | 'reviewed' | 'high-score' | 'needs-improvement';

export default function WritingReviewPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all submissions for current user
  const { data: submissions = [], isLoading } = useStudentSubmissions(session?.user?.email);

  // Helper to get exercise title
  const getExerciseTitle = (exerciseId: string, exerciseType: WritingExerciseType): string => {
    if (exerciseType === 'translation') {
      const exercise = TRANSLATION_EXERCISES.find(ex => ex.exerciseId === exerciseId);
      return exercise?.title || 'Translation Exercise';
    } else if (exerciseType === 'creative') {
      const exercise = CREATIVE_EXERCISES.find(ex => ex.exerciseId === exerciseId);
      return exercise?.title || 'Creative Writing';
    } else if (exerciseType === 'email') {
      const template = EMAIL_TEMPLATES.find(t => t.templateId === exerciseId);
      return template?.name || 'Email Writing';
    } else if (exerciseType === 'formal-letter' || exerciseType === 'informal-letter') {
      const template = LETTER_TEMPLATES.find(t => t.templateId === exerciseId);
      return template?.title || 'Letter Writing';
    }
    return 'Writing Exercise';
  };

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Filter by level
      if (selectedLevel !== 'all' && submission.level !== selectedLevel) {
        return false;
      }

      // Filter by status/score
      if (filterType === 'reviewed' && submission.status !== 'reviewed') {
        return false;
      }
      if (filterType === 'high-score' && (!submission.teacherScore || submission.teacherScore < 80)) {
        return false;
      }
      if (filterType === 'needs-improvement' && submission.teacherScore && submission.teacherScore >= 70) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const exerciseTitle = getExerciseTitle(submission.exerciseId, submission.exerciseType).toLowerCase();
        const content = submission.content.toLowerCase();
        const feedback = submission.teacherFeedback?.toLowerCase() || '';

        return exerciseTitle.includes(query) || content.includes(query) || feedback.includes(query);
      }

      return true;
    });
  }, [submissions, selectedLevel, filterType, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const reviewed = submissions.filter(s => s.status === 'reviewed').length;
    const highScore = submissions.filter(s => s.teacherScore && s.teacherScore >= 80).length;
    const needsWork = submissions.filter(s => s.teacherScore && s.teacherScore < 70).length;
    const avgScore = submissions.filter(s => s.teacherScore).reduce((sum, s) => sum + (s.teacherScore || 0), 0) /
                     submissions.filter(s => s.teacherScore).length || 0;

    return { reviewed, highScore, needsWork, avgScore: Math.round(avgScore) };
  }, [submissions]);

  if (!session) {
    return <CatLoader message="Loading..." size="lg" fullScreen />;
  }

  if (isLoading) {
    return <CatLoader message="Loading your writing history..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Writing Review 📚"
        subtitle="Review your past writing submissions and feedback"
        backButton={{
          label: 'Back to Writing',
          onClick: () => router.push('/dashboard/student/writing')
        }}
      />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Reviewed</div>
            <div className="text-4xl font-black text-green-600 mb-2">{stats.reviewed}</div>
            <div className="text-xs text-gray-600">Submissions graded</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 uppercase font-semibold mb-2">High Scores</div>
            <div className="text-4xl font-black text-blue-600 mb-2">{stats.highScore}</div>
            <div className="text-xs text-gray-600">Score 80% or higher</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Needs Work</div>
            <div className="text-4xl font-black text-orange-600 mb-2">{stats.needsWork}</div>
            <div className="text-xs text-gray-600">Score below 70%</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Avg Score</div>
            <div className="text-4xl font-black text-purple-600 mb-2">{stats.avgScore}%</div>
            <div className="text-xs text-gray-600">Overall average</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {/* Level Selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Level:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLevel === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Levels
              </button>
              {Object.values(CEFRLevel).map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {CEFRLevelInfo[level].displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setFilterType('reviewed')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterType === 'reviewed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reviewed ({stats.reviewed})
              </button>
              <button
                onClick={() => setFilterType('high-score')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterType === 'high-score'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Scores ({stats.highScore})
              </button>
              <button
                onClick={() => setFilterType('needs-improvement')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterType === 'needs-improvement'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Needs Work ({stats.needsWork})
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercises, content, or feedback..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600 mb-6">
              {filterType === 'all'
                ? 'Start writing exercises to build your portfolio.'
                : 'Try adjusting your filters to see more submissions.'}
            </p>
            <button
              onClick={() => router.push('/dashboard/student/writing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Writing Hub
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(submission => (
              <div
                key={submission.submissionId}
                onClick={() => router.push(`/dashboard/student/writing/feedback/${submission.submissionId}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {getExerciseTitle(submission.exerciseId, submission.exerciseType)}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{CEFRLevelInfo[submission.level as CEFRLevel]?.displayName || submission.level}</span>
                      <span>•</span>
                      <span>{submission.wordCount} words</span>
                      <span>•</span>
                      <span>
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {submission.teacherScore !== undefined && (
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                        submission.teacherScore >= 80 ? 'bg-green-100 text-green-700' :
                        submission.teacherScore >= 70 ? 'bg-blue-100 text-blue-700' :
                        submission.teacherScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {submission.teacherScore}%
                      </div>
                    )}
                    <Badge
                      variant={
                        submission.status === 'reviewed' ? 'success' :
                        submission.status === 'submitted' ? 'warning' :
                        'default'
                      }
                    >
                      {submission.status === 'reviewed' ? 'Reviewed' :
                       submission.status === 'submitted' ? 'Pending' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {submission.teacherFeedback && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-semibold text-gray-700">Feedback: </span>
                      {submission.teacherFeedback}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {submission.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
