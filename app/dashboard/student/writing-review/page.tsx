'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCardSimple } from '@/components/ui/StatCardSimple';
import { Input } from '@/components/ui/Input';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all submissions for current user
  const { data: submissions = [], isLoading } = useStudentSubmissions(session?.user?.email ?? undefined);

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
  }, [submissions, filterType, searchQuery]);

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

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCardSimple
            label="Reviewed"
            value={stats.reviewed.toString()}
            color="green"
          />
          <StatCardSimple
            label="High Scores"
            value={stats.highScore.toString()}
            color="blue"
          />
          <StatCardSimple
            label="Needs Work"
            value={stats.needsWork.toString()}
            color="orange"
          />
          <StatCardSimple
            label="Avg Score"
            value={`${stats.avgScore}%`}
            color="purple"
          />
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Filter Buttons */}
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

            {/* Search */}
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercises, content, or feedback..."
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </Card>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No submissions found"
            description={filterType === 'all'
              ? 'Start writing exercises to build your portfolio.'
              : 'Try adjusting your filters to see more submissions.'}
            action={{
              label: 'Go to Writing Hub',
              onClick: () => router.push('/dashboard/student/writing')
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map(submission => (
              <Card
                key={submission.submissionId}
                onClick={() => router.push(`/dashboard/student/writing/feedback/${submission.submissionId}`)}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
