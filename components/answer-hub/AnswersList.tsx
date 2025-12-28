/**
 * Answers List Component
 * Displays correct answers for an exercise (teachers only)
 * Students can input and save their answers
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExerciseAnswer } from '@/lib/models/exercises';
import { TeacherAnswerDisplay } from './TeacherAnswerDisplay';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { useSaveStudentAnswer, useStudentAnswers } from '@/lib/hooks/useStudentAnswers';
import { useToast } from '@/lib/hooks/useToast';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

interface AnswerInputRowProps {
  answer: ExerciseAnswer;
  value: string;
  onChange: (value: string) => void;
  canSave: boolean;
  isSaving: boolean;
}

function AnswerInputRow({ answer, value, onChange, canSave, isSaving }: AnswerInputRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`bg-gray-50 border border-gray-200 p-4 ${!canSave ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Pencil Icon */}
        <div className="flex-shrink-0 mt-1">
          <svg
            className={`w-5 h-5 ${canSave ? 'text-blue-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item {answer.itemNumber}
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={canSave ? "Type your answer here..." : "Saving disabled - type for practice only"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={!canSave}
              className={`w-full px-3 py-2 border border-gray-300 outline-none transition-colors text-sm ${
                canSave
                  ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                  : 'bg-gray-100 cursor-not-allowed'
              }`}
            />
            <GermanCharAutocomplete
              textareaRef={inputRef}
              content={value}
              onContentChange={onChange}
            />
          </div>

          {/* Saving indicator */}
          <p className="mt-1 text-xs text-gray-500">
            {canSave ? (
              isSaving ? (
                <span className="text-blue-600 font-medium">Saving...</span>
              ) : (
                'Your answer will be saved automatically'
              )
            ) : (
              <span className="text-amber-600">Saving disabled</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AnswersListProps {
  answers: ExerciseAnswer[];
  exerciseId: string;
  showExplanations?: boolean;
  isTeacher?: boolean;
}

export function AnswersList({
  answers,
  exerciseId,
  showExplanations = true,
  isTeacher = false
}: AnswersListProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userId, userName } = getUserInfo(currentUser, session);

  const [isCollapsed, setIsCollapsed] = useState(!isTeacher);
  const [studentInputs, setStudentInputs] = useState<Record<string, string>>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  const { saveAnswer } = useSaveStudentAnswer();
  const { showToast } = useToast();

  // Check if saving is enabled (requires exerciseId and authenticated user)
  const canSave = Boolean(exerciseId && userId && userName);

  // Debounce timer for auto-save
  const [saveTimers, setSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Auto-save with debouncing (500ms delay)
  const handleInputChange = useCallback((itemNumber: string, value: string) => {
    setStudentInputs(prev => ({ ...prev, [itemNumber]: value }));

    // Don't save if prerequisites aren't met
    if (!canSave) {
      return;
    }

    // Clear existing timer
    if (saveTimers[itemNumber]) {
      clearTimeout(saveTimers[itemNumber]);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      if (!value || value.trim() === '') {
        // Don't save empty answers
        return;
      }

      setSavingStates(prev => ({ ...prev, [itemNumber]: true }));

      const success = await saveAnswer(
        userId!,
        userName!,
        exerciseId!,
        itemNumber,
        value.trim()
      );

      setSavingStates(prev => ({ ...prev, [itemNumber]: false }));

      if (success) {
        showToast(`Answer for Item ${itemNumber} saved!`, 'success');
      } else {
        showToast(`Failed to save answer for Item ${itemNumber}`, 'error');
      }
    }, 500);

    setSaveTimers(prev => ({ ...prev, [itemNumber]: timer }));
  }, [canSave, userId, userName, exerciseId, saveAnswer, showToast, saveTimers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimers).forEach(timer => clearTimeout(timer));
    };
  }, [saveTimers]);

  // Teacher view: Show correct answers (always visible, NOT collapsible)
  if (isTeacher) {
    return <TeacherAnswerDisplay answers={answers} showExplanations={showExplanations} />;
  }

  if (answers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No answers available
      </div>
    );
  }

  // Student view: Three separate sections
  return (
    <div className="space-y-8">
      {/* Section 1: Exercise Items - Collapsible (shows item numbers only) */}
      <div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors duration-200 mb-2"
        >
          <span className="text-sm font-semibold">
            {isCollapsed ? 'Show Exercise Items' : 'Hide Exercise Items'} ({answers.length} item{answers.length !== 1 ? 's' : ''})
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-semibold">Exercise has {answers.length} item{answers.length !== 1 ? 's' : ''}:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {answers.map((answer, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Item {answer.itemNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Your Answers - NOT Collapsible (input fields) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Answers
        </h3>

        {/* Warning if saving is disabled */}
        {!canSave && (
          <div className="bg-amber-50 border border-amber-200 p-4 mb-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-amber-800 font-semibold mb-1">
                  Answer saving is disabled
                </p>
                <p className="text-xs text-amber-700">
                  {!exerciseId && 'Exercise ID is missing. '}
                  {!userId && !userName && 'Please log in to save your answers. '}
                  You can still type your answers for practice.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {answers.map((answer, index) => (
            <AnswerInputRow
              key={index}
              answer={answer}
              value={studentInputs[answer.itemNumber] || ''}
              onChange={(newValue) => handleInputChange(answer.itemNumber, newValue)}
              canSave={canSave}
              isSaving={!!savingStates[answer.itemNumber]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
