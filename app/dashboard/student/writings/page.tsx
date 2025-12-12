'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { DiffTextCorrectedOnly } from '@/components/writing/DiffText';
import { useWritingsData } from '@/lib/hooks/useWritingsData';
import Link from 'next/link';

export default function WritingsPage() {
  const { data: session } = useSession();

  // Use the consolidated hook for all data management
  const {
    submissions,
    teacherReviews,
    isLoading,
    hasMore,
    loadMoreRef,
    totalWithCorrections,
  } = useWritingsData(session?.user?.email || null);

  if (isLoading) {
    return <CatLoader message="Loading your writings..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Your Writings ✍️"
        subtitle="Review all your corrected writing submissions"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Writings List */}
        {totalWithCorrections === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Corrected Writings Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Your corrected writing submissions will appear here once you receive feedback.
            </p>
            <Link
              href="/dashboard/student/writing"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const teacherReview = teacherReviews?.[submission.submissionId];
              const correctedText = teacherReview?.correctedVersion || submission.aiCorrectedVersion;

              return (
                <WritingCard
                  key={submission.submissionId}
                  submission={submission}
                  teacherReview={teacherReview}
                  correctedText={correctedText}
                />
              );
            })}

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WritingCardProps {
  submission: WritingSubmission;
  teacherReview?: TeacherReview;
  correctedText?: string;
}

function WritingCard({ submission, teacherReview, correctedText }: WritingCardProps) {
  const [showVersions, setShowVersions] = useState(false);

  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  const hasVersions = (submission.previousVersions?.length || 0) > 0;

  return (
    <div className="bg-white border border-gray-200 p-6 relative">
      {/* Top Right: Score Badge and View Link */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {teacherReview && (
          <div className="px-2 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
            {teacherReview.overallScore}/100
          </div>
        )}
        <Link
          href={`/dashboard/student/writing/feedback/${submission.submissionId}`}
          className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
        >
          View
        </Link>
      </div>

      {/* Content */}
      <div>
        {/* Original English (for translations) */}
        {submission.exerciseType === 'translation' && submission.originalText && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <span>🇬🇧</span> Original English
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {submission.originalText}
            </p>
          </div>
        )}

        {/* Corrected Version with Highlights - MAIN/LARGER */}
        {correctedText && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>{teacherReview ? '✏️' : '✨'}</span>
              {teacherReview ? 'Teacher\'s Correction' : 'AI Correction'}
            </h4>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <DiffTextCorrectedOnly
                originalText={submission.content}
                correctedText={correctedText}
                className="text-lg"
              />
            </div>

            {/* Teacher Feedback */}
            {teacherReview && teacherReview.overallComment && (
              <div className="mt-4 bg-blue-50 border border-blue-200 p-4">
                <h5 className="text-sm font-bold text-blue-900 mb-2">Teacher's Comment:</h5>
                <p className="text-sm text-blue-800">{teacherReview.overallComment}</p>
              </div>
            )}

            {/* Your Original Translation - SMALLER */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>✍️</span> Your Original
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
          </div>
        )}

        {/* Version History Toggle */}
        {hasVersions && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>{showVersions ? '▼' : '▶'}</span>
              <span>Version History ({submission.previousVersions!.length} versions)</span>
            </button>

            {/* Stacked Versions */}
            {showVersions && (
              <div className="mt-4 space-y-3">
                {submission.previousVersions!.map((version, index) => (
                  <div
                    key={version.version}
                    className="bg-gray-50 border border-gray-200 p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        Version {version.version}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(version.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {version.content}
                    </p>
                    {version.changes && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Changes: {version.changes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
