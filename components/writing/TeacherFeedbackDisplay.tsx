/**
 * TeacherFeedbackDisplay Component
 * Displays comprehensive teacher review with scores and feedback
 */

import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { TeacherReview } from '@/lib/models/writing';

interface TeacherFeedbackDisplayProps {
  teacherReview: TeacherReview;
}

export function TeacherFeedbackDisplay({ teacherReview }: TeacherFeedbackDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <ActivityCard title="Overall Score">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-700 mb-1">Your Score</div>
              <div className="text-5xl font-black text-blue-600">{teacherReview.overallScore}%</div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Grammar:</span>
                <span className="font-bold text-emerald-600">{teacherReview.grammarScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Vocabulary:</span>
                <span className="font-bold text-purple-600">{teacherReview.vocabularyScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Coherence:</span>
                <span className="font-bold text-amber-600">{teacherReview.coherenceScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </ActivityCard>

      {/* Overall Comment */}
      <ActivityCard title="Teacher's Comments">
        <p className="text-neutral-700 leading-relaxed">{teacherReview.overallComment}</p>
      </ActivityCard>

      {/* Strengths */}
      {teacherReview.strengths && teacherReview.strengths.length > 0 && (
        <ActivityCard title="Strengths" subtitle="What you did well">
          <ul className="space-y-2">
            {teacherReview.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span className="text-neutral-700">{strength}</span>
              </li>
            ))}
          </ul>
        </ActivityCard>
      )}

      {/* Areas for Improvement */}
      {teacherReview.areasForImprovement && teacherReview.areasForImprovement.length > 0 && (
        <ActivityCard title="Areas for Improvement" subtitle="Focus on these next time">
          <ul className="space-y-2">
            {teacherReview.areasForImprovement.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">→</span>
                <span className="text-neutral-700">{area}</span>
              </li>
            ))}
          </ul>
        </ActivityCard>
      )}

      {/* Revision Requirements */}
      {teacherReview.requiresRevision && (
        <ActivityCard title="Revision Required">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-900 font-semibold mb-2">
              Please revise and resubmit this work
            </p>
            {teacherReview.revisionInstructions && (
              <p className="text-amber-800 text-sm">{teacherReview.revisionInstructions}</p>
            )}
          </div>
        </ActivityCard>
      )}

      {/* Meets Criteria Badge */}
      {teacherReview.meetsCriteria && (
        <ActivityCard title="Assessment">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-emerald-900 font-semibold">
              Meets All Exercise Criteria
            </p>
          </div>
        </ActivityCard>
      )}
    </div>
  );
}
