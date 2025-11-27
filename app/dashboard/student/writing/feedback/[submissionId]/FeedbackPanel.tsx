/**
 * FeedbackPanel Component
 * Right panel with tabs for feedback and history
 */

import { useState, useEffect } from 'react';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { WritingFeedback as WritingFeedbackComponent } from '@/components/writing/WritingFeedback';
import { TeacherFeedbackDisplay } from '@/components/writing/TeacherFeedbackDisplay';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { getUser } from '@/lib/services/userService';
import { getUserFullName } from '@/lib/models/user';

interface FeedbackPanelProps {
  submission: WritingSubmission;
  teacherReview: TeacherReview | undefined;
  teacherReviewLoading: boolean;
  activeTab: 'feedback' | 'history';
  onTabChange: (tab: 'feedback' | 'history') => void;
}

export function FeedbackPanel({
  submission,
  teacherReview,
  teacherReviewLoading,
  activeTab,
  onTabChange,
}: FeedbackPanelProps) {
  const [authorName, setAuthorName] = useState<string>('You');

  useEffect(() => {
    async function fetchAuthorName() {
      if (submission.userId) {
        try {
          const user = await getUser(submission.userId);
          if (user) {
            const displayName = (user as any).name || getUserFullName(user);
            setAuthorName(displayName);
          }
        } catch (error) {
          console.error('Failed to fetch user name:', error);
        }
      }
    }
    fetchAuthorName();
  }, [submission.userId]);

  return (
    <div className="w-[400px] flex flex-col">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <TabButton
          label="Feedback"
          active={activeTab === 'feedback'}
          badge={teacherReview ? '✓' : undefined}
          onClick={() => onTabChange('feedback')}
        />
        <TabButton
          label="History"
          active={activeTab === 'history'}
          count={submission.previousVersions?.length || 0}
          onClick={() => onTabChange('history')}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Teacher Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {teacherReviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading feedback...</p>
                </div>
              </div>
            ) : teacherReview ? (
              <TeacherFeedbackDisplay teacherReview={teacherReview} />
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Awaiting Teacher Review</h3>
                <p className="text-xs text-gray-600">
                  Your teacher will review your submission soon.
                </p>
              </div>
            )}

            {/* Legacy AI Feedback (if exists) */}
            {submission.aiFeedback && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <WritingFeedbackComponent
                  feedback={submission.aiFeedback}
                  studentText={submission.content}
                  referenceText={submission.originalText}
                />
              </div>
            )}
          </div>
        )}

        {/* Revision History Tab */}
        {activeTab === 'history' && (
          <ActivityTimeline
            items={[
              // Current version
              {
                id: 'current',
                icon: <span className="text-white text-xs">✓</span>,
                iconColor: 'bg-blue-500',
                title: `Version ${submission.version}`,
                description: `${submission.wordCount} words • ${submission.characterCount} characters`,
                timestamp: submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Draft',
                tags: [
                  {
                    label: 'Current',
                    color: 'blue',
                  },
                  {
                    label: submission.status,
                    color: submission.status === 'submitted' ? 'amber' :
                           submission.status === 'reviewed' ? 'green' : 'gray',
                  },
                ],
                metadata: (
                  <div className="text-xs text-gray-500 mt-1">
                    <span>By: {authorName}</span>
                  </div>
                ),
              },
              // Previous versions (if any)
              ...(submission.previousVersions || []).map((version) => ({
                id: `version-${version.version}`,
                icon: <span className="text-white text-xs">{version.version}</span>,
                iconColor: 'bg-gray-400',
                title: `Version ${version.version}`,
                description: version.wordCount
                  ? `${version.wordCount} words`
                  : 'Previous version',
                timestamp: version.savedAt
                  ? new Date(version.savedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A',
                metadata: (
                  <div className="text-xs text-gray-500 mt-1">
                    <span>By: {authorName}</span>
                  </div>
                ),
              })),
            ] as ActivityItem[]}
            showConnector={true}
            showPagination={false}
          />
        )}
      </div>
    </div>
  );
}

// Helper Components
interface TabButtonProps {
  label: string;
  active: boolean;
  badge?: string;
  count?: number;
  onClick: () => void;
}

function TabButton({ label, active, badge, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      {badge && <span className="ml-1 text-xs">{badge}</span>}
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </button>
  );
}
