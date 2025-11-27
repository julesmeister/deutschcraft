/**
 * TeacherFeedbackDisplay Component
 * Displays comprehensive teacher review with scores and feedback
 */

import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { TeacherReview } from '@/lib/models/writing';

interface TeacherFeedbackDisplayProps {
  teacherReview: TeacherReview;
}

export function TeacherFeedbackDisplay({ teacherReview }: TeacherFeedbackDisplayProps) {
  const feedbackItems: ActivityItem[] = [
    // Overall Score
    {
      id: 'overall-score',
      icon: <span className="text-white text-xs">📊</span>,
      iconColor: 'bg-blue-500',
      title: 'Overall Score',
      description: `${teacherReview.overallScore}% • Grammar: ${teacherReview.grammarScore}% • Vocabulary: ${teacherReview.vocabularyScore}% • Coherence: ${teacherReview.coherenceScore}%`,
      tags: [
        {
          label: `${teacherReview.overallScore}%`,
          color: teacherReview.overallScore >= 80 ? 'green' : teacherReview.overallScore >= 60 ? 'amber' : 'red',
        },
      ],
    },
    // Teacher's Comment
    {
      id: 'comment',
      icon: <span className="text-white text-xs">💬</span>,
      iconColor: 'bg-purple-500',
      title: "Teacher's Comments",
      description: teacherReview.overallComment,
    },
    // Strengths
    ...(teacherReview.strengths && teacherReview.strengths.length > 0
      ? [
          {
            id: 'strengths',
            icon: <span className="text-white text-xs">✓</span>,
            iconColor: 'bg-emerald-500',
            title: 'Strengths',
            description: 'What you did well',
            metadata: (
              <ul className="space-y-1 mt-2 text-xs text-gray-700">
                {teacherReview.strengths?.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ),
          } as ActivityItem,
        ]
      : []),
    // Areas for Improvement
    ...(teacherReview.areasForImprovement && teacherReview.areasForImprovement.length > 0
      ? [
          {
            id: 'improvements',
            icon: <span className="text-white text-xs">→</span>,
            iconColor: 'bg-amber-500',
            title: 'Areas for Improvement',
            description: 'Focus on these next time',
            metadata: (
              <ul className="space-y-1 mt-2 text-xs text-gray-700">
                {teacherReview.areasForImprovement?.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ),
          } as ActivityItem,
        ]
      : []),
    // Revision Required
    ...(teacherReview.requiresRevision
      ? [
          {
            id: 'revision',
            icon: <span className="text-white text-xs">⚠</span>,
            iconColor: 'bg-red-500',
            title: 'Revision Required',
            description: teacherReview.revisionInstructions || 'Please revise and resubmit this work',
            tags: [{ label: 'Action Required', color: 'red' }],
          } as ActivityItem,
        ]
      : []),
    // Meets Criteria
    ...(teacherReview.meetsCriteria
      ? [
          {
            id: 'criteria',
            icon: <span className="text-white text-xs">✓</span>,
            iconColor: 'bg-emerald-500',
            title: 'Assessment Complete',
            description: 'Meets all exercise criteria',
            tags: [{ label: 'Approved', color: 'green' }],
          } as ActivityItem,
        ]
      : []),
  ];

  return (
    <ActivityTimeline
      items={feedbackItems}
      showConnector={true}
      showPagination={false}
    />
  );
}
