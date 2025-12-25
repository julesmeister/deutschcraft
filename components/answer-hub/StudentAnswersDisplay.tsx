/**
 * Student Answers Display Component
 * Shows all student submissions for an exercise
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStudentAnswers, useSaveStudentAnswer } from '@/lib/hooks/useStudentAnswers';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { useToast } from '@/lib/hooks/useToast';
import { StudentAnswerBubble } from './StudentAnswerBubble';

interface StudentAnswersDisplayProps {
  exerciseId: string;
}

export function StudentAnswersDisplay({ exerciseId }: StudentAnswersDisplayProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userId } = getUserInfo(currentUser, session);

  const { answers: allStudentAnswers, isLoading } = useStudentAnswers(exerciseId);
  const { saveAnswer } = useSaveStudentAnswer();
  const { showToast } = useToast();

  // Track saving states for auto-save
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [saveTimers, setSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Auto-save with debouncing
  const handleEditChange = useCallback((
    studentId: string,
    studentName: string,
    itemNumber: string,
    value: string
  ) => {
    const key = `${studentId}_${itemNumber}`;

    // Clear existing timer
    if (saveTimers[key]) {
      clearTimeout(saveTimers[key]);
    }

    // Set new timer for auto-save
    const timer = setTimeout(async () => {
      if (!value || value.trim() === '') {
        return;
      }

      setSavingStates(prev => ({ ...prev, [key]: true }));

      const success = await saveAnswer(
        studentId,
        studentName,
        exerciseId,
        itemNumber,
        value.trim()
      );

      setSavingStates(prev => ({ ...prev, [key]: false }));

      if (success) {
        showToast(`Answer updated for Item ${itemNumber}`, 'success');
      } else {
        showToast(`Failed to update answer for Item ${itemNumber}`, 'error');
      }
    }, 500);

    setSaveTimers(prev => ({ ...prev, [key]: timer }));
  }, [exerciseId, saveAnswer, showToast, saveTimers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimers).forEach(timer => clearTimeout(timer));
    };
  }, [saveTimers]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center text-gray-500">
          <svg
            className="animate-spin h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading student answers...
        </div>
      </div>
    );
  }

  if (allStudentAnswers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          No Student Answers Yet
        </h3>
        <p className="text-sm text-gray-600">
          Student answers will appear here once they start submitting their work.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-lg font-black text-gray-900">
            Student Answers
          </h2>
          <span className="text-sm text-gray-600">
            ({allStudentAnswers.length} student{allStudentAnswers.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Student Answers List */}
      <div className="p-6">
        {allStudentAnswers.map((studentAnswers, idx) => (
          studentAnswers.answers.map((ans, ansIdx) => {
            const key = `${studentAnswers.studentId}_${ans.itemNumber}`;
            const isSaving = savingStates[key];
            const isOwnAnswer = userId === studentAnswers.studentId;

            return (
              <StudentAnswerBubble
                key={`${idx}_${ansIdx}`}
                itemNumber={ans.itemNumber}
                answer={ans.studentAnswer}
                studentName={studentAnswers.studentName}
                isOwnAnswer={isOwnAnswer}
                isSaving={isSaving}
                submittedAt={ans.submittedAt}
                onEdit={
                  isOwnAnswer
                    ? (value) =>
                        handleEditChange(
                          studentAnswers.studentId,
                          studentAnswers.studentName,
                          ans.itemNumber,
                          value
                        )
                    : undefined
                }
              />
            );
          })
        ))}
      </div>
    </div>
  );
}
