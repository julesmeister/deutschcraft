"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { WritingSubmission, TeacherReview } from "@/lib/models/writing";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { DiffTextCorrectedOnly } from "@/components/writing/DiffText";
import { useWritingsData } from "@/lib/hooks/useWritingsData";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import Link from "next/link";

export default function WritingsPage() {
  const { data: session } = useSession();

  // Use the consolidated hook for all data management
  const {
    submissions,
    teacherReviews,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalWithCorrections,
  } = useWritingsData(session?.user?.email || null);

  if (isLoading) {
    return (
      <CatLoader message="Loading your writings..." size="lg" fullScreen />
    );
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
          <div className="bg-[#f2f2e5] rounded-[10px] p-12 text-center transition-all duration-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Corrected Writings Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Your corrected writing submissions will appear here once you
              receive feedback.
            </p>
            <Link
              href="/dashboard/student/writing"
              className="inline-block px-6 py-3 bg-[#11316e] text-white font-bold rounded-lg hover:bg-[#559adc] transition-all duration-500"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const teacherReview = teacherReviews?.[submission.submissionId];
              const correctedText =
                teacherReview?.correctedVersion ||
                submission.aiCorrectedVersion;

              return (
                <WritingCard
                  key={submission.submissionId}
                  submission={submission}
                  teacherReview={teacherReview}
                  correctedText={correctedText}
                />
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  variant="pills"
                />
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

function WritingCard({
  submission,
  teacherReview,
  correctedText,
}: WritingCardProps) {
  const [showVersions, setShowVersions] = useState(false);
  const router = useRouter();

  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const hasVersions = (submission.previousVersions?.length || 0) > 0;

  // Rotate through background colors similar to service cards
  const backgrounds = [
    "bg-[#e2f2f0c4]",
    "bg-[#f2f2e5]",
    "bg-[#c3e1cd80]",
    "bg-[#ece2efc4]",
  ];
  const bgClass =
    backgrounds[
      Math.abs(submission.submissionId.charCodeAt(0)) % backgrounds.length
    ];

  return (
    <div
      className={`${bgClass} rounded-[10px] px-6 pt-6 pb-4 md:px-[25px] md:pt-[30px] md:pb-4 relative transition-all duration-500`}
    >
      {/* Top Right: Score Badge and View Button */}
      <div className="absolute top-4 right-4 md:top-[30px] md:right-[25px] flex items-center gap-3">
        {teacherReview && (
          <div className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg">
            {!isNaN(Number(teacherReview.overallScore))
              ? `${teacherReview.overallScore}/100`
              : "Not graded yet"}
          </div>
        )}
        <div className="w-[140px]">
          <ActionButton
            onClick={() =>
              router.push(
                `/dashboard/student/writing/feedback/${submission.submissionId}`
              )
            }
            icon={<ActionButtonIcons.Eye />}
            variant="purple"
            size="compact"
          >
            View Details
          </ActionButton>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 md:pt-2">
        {/* Original English (for translations) */}
        {submission.exerciseType === "translation" &&
          submission.originalText && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#4e5e7c] uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>🇬🇧</span> Original English
              </h4>
              <p className="text-[#4e5e7c] leading-relaxed">
                {submission.originalText}
              </p>
            </div>
          )}

        {/* Corrected Version with Highlights - MAIN/LARGER */}
        {correctedText ? (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-[#11316e] uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>{teacherReview ? "✏️" : "✨"}</span>
              {teacherReview ? "Teacher's Correction" : "AI Correction"}
            </h4>
            <div className="bg-white/60 rounded-lg border border-[#4e5e7c26] p-4 md:p-5">
              <DiffTextCorrectedOnly
                originalText={submission.content}
                correctedText={correctedText}
                className="text-lg"
              />
            </div>

            {/* Teacher Feedback */}
            {teacherReview && teacherReview.overallComment && (
              <div className="mt-4 bg-blue-50/80 rounded-lg border border-blue-200 p-4 md:p-5">
                <h5 className="text-sm font-bold text-blue-900 mb-2">
                  Teacher's Comment:
                </h5>
                <p className="text-sm text-blue-800">
                  {teacherReview.overallComment}
                </p>
              </div>
            )}

            {/* Your Original Translation - SMALLER */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-[#4e5e7c] uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>✍️</span> Your Original
              </h4>
              <p className="text-sm text-[#4e5e7c] leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-[#11316e] uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>✍️</span> Your Submission
            </h4>
            <div className="bg-white/60 rounded-lg border border-[#4e5e7c26] p-4 md:p-5">
              <p className="text-base text-[#4e5e7c] leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>

            {/* Teacher Feedback (if exists without correction) */}
            {teacherReview && teacherReview.overallComment && (
              <div className="mt-4 bg-blue-50/80 rounded-lg border border-blue-200 p-4 md:p-5">
                <h5 className="text-sm font-bold text-blue-900 mb-2">
                  Teacher's Comment:
                </h5>
                <p className="text-sm text-blue-800">
                  {teacherReview.overallComment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Version History Toggle */}
        {hasVersions && (
          <div className="mt-6 border-t border-[#4e5e7c26] pt-6">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center gap-2 text-sm font-bold text-[#11316e] hover:text-[#559adc] transition-colors duration-500"
            >
              <span>{showVersions ? "▼" : "▶"}</span>
              <span>
                Version History ({submission.previousVersions!.length} versions)
              </span>
            </button>

            {/* Stacked Versions */}
            {showVersions && (
              <div className="mt-4 space-y-3">
                {submission.previousVersions!.map((version, index) => (
                  <div
                    key={version.version}
                    className="bg-white/60 rounded-lg border border-[#4e5e7c26] p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#4e5e7c] uppercase">
                        Version {version.version}
                      </span>
                      <span className="text-xs text-[#4e5e7c]">
                        {new Date(version.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#4e5e7c] leading-relaxed whitespace-pre-wrap">
                      {version.content}
                    </p>
                    {version.changes && (
                      <p className="text-xs text-[#4e5e7c] mt-2 italic">
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
