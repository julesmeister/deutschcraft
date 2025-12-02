/**
 * MiniBlankExercise Component
 * Displays a single random fill-in-the-blank sentence from corrected writing exercises
 * Mini practice exercise for the student dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { QuizBlank } from '@/lib/models/writing';
import { checkAnswer } from '@/lib/utils/quizGenerator';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { useQuizStats, calculateQuizPoints } from '@/lib/hooks/useQuizStats';
import { useToast } from '@/components/ui/toast';
import confetti from 'canvas-confetti';

interface MiniBlankExerciseProps {
  sentence: string;
  blanks: QuizBlank[];
  onRefresh: () => void;
  onComplete?: (points: number, correctAnswers: number, totalBlanks: number, sentenceId?: string) => void;
  userId?: string;
  isLoading?: boolean;
  exerciseType?: string;
  submittedAt?: number;
  sentenceId?: string;
}

export function MiniBlankExercise({ sentence, blanks, onRefresh, onComplete, userId, isLoading, exerciseType, submittedAt, sentenceId }: MiniBlankExerciseProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const toast = useToast();

  // Fetch quiz stats
  const { data: quizStats } = useQuizStats(userId);

  // Reset state when sentence changes
  useEffect(() => {
    setAnswers({});
    setShowResult(false);
    setIsCorrect(false);
  }, [sentence]);

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const handleCheck = () => {
    // Check if all blanks are filled
    const allFilled = blanks.every(blank => answers[blank.index]?.trim().length > 0);
    if (!allFilled) return;

    // Calculate score and collect incorrect answers
    let correctAnswers = 0;
    const incorrectAnswers: Array<{ wrong: string; correct: string }> = [];

    blanks.forEach(blank => {
      const studentAnswer = answers[blank.index] || '';
      if (checkAnswer(studentAnswer, blank.correctAnswer)) {
        correctAnswers++;
      } else {
        incorrectAnswers.push({
          wrong: studentAnswer,
          correct: blank.correctAnswer
        });
      }
    });

    const points = calculateQuizPoints(correctAnswers, blanks.length);
    const allCorrect = correctAnswers === blanks.length;

    setIsCorrect(allCorrect);
    setShowResult(true);

    // Show toast with results
    if (allCorrect) {
      // Trigger confetti for perfect score
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Perfect! +${points} points!`);
    } else {
      // Show corrections in toast
      const corrections = incorrectAnswers.map(item =>
        `"${item.wrong}" → "${item.correct}"`
      ).join(', ');
      toast.warning(`Not quite right. +${points} points. Corrections: ${corrections}`);
    }

    // Notify parent component
    if (onComplete) {
      onComplete(points, correctAnswers, blanks.length, sentenceId);
    }
  };

  const handleNext = () => {
    onRefresh();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Quick Practice</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (blanks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Quick Practice</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Complete writing exercises to unlock quick practice sentences!
        </p>
      </div>
    );
  }

  // Build the display parts with blanks
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankIndex?: number }> = [];
  let lastPosition = 0;

  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  for (const blank of sortedBlanks) {
    // Add text before blank
    if (blank.position > lastPosition) {
      parts.push({
        type: 'text',
        content: sentence.substring(lastPosition, blank.position)
      });
    }

    // Add blank
    parts.push({
      type: 'blank',
      content: blank.correctAnswer,
      blankIndex: blank.index
    });

    lastPosition = blank.position + blank.correctAnswer.length;
  }

  // Add remaining text
  if (lastPosition < sentence.length) {
    parts.push({
      type: 'text',
      content: sentence.substring(lastPosition)
    });
  }

  const allFilled = blanks.every(blank => answers[blank.index]?.trim().length > 0);

  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">📝</span>
          <h3 className="text-base md:text-lg font-bold text-gray-900">Quick Practice</h3>
        </div>

        {/* Desktop: Action buttons + Points badge */}
        <div className="hidden lg:flex items-center gap-3">
          {quizStats && quizStats.totalQuizzes > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <span className="text-xs font-medium text-gray-600">Points:</span>
              <span className="text-sm font-bold text-gray-900">{quizStats.totalPoints}</span>
            </div>
          )}
          {!showResult ? (
            <div className="w-48">
              <ActionButton
                onClick={handleCheck}
                disabled={!allFilled}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
                size="compact"
              >
                Check Answer
              </ActionButton>
            </div>
          ) : (
            <div className="w-40">
              <ActionButton
                onClick={handleNext}
                variant="mint"
                icon={<ActionButtonIcons.ArrowRight />}
                size="compact"
              >
                Next
              </ActionButton>
            </div>
          )}
        </div>

        {/* Mobile/Tablet: Score badge only */}
        <div className="lg:hidden">
          {quizStats && quizStats.totalQuizzes > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
              <span className="text-[10px] font-medium text-gray-600">Avg:</span>
              <span className="text-xs font-bold text-gray-900">{quizStats.averageScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        {exerciseType && submittedAt ? (
          <>
            From your <span className="font-medium text-gray-900 capitalize">{exerciseType}</span> exercise
            <span className="text-gray-500"> • {new Date(submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </>
        ) : (
          <>Fill in the blank{blanks.length > 1 ? 's' : ''} with the correct word{blanks.length > 1 ? 's' : ''}</>
        )}
      </p>

      {/* Sentence with blanks */}
      <div className="mb-6 text-lg leading-loose">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index} className="text-gray-900">{part.content}</span>;
          } else {
            const blankIndex = part.blankIndex!;
            const studentAnswer = answers[blankIndex] || '';
            const hasAnswer = showResult;
            const answerIsCorrect = hasAnswer && checkAnswer(studentAnswer, part.content);
            const answerIsIncorrect = hasAnswer && !answerIsCorrect;

            return (
              <span key={index} className="inline-flex items-center gap-1 mx-1.5 my-2">
                <input
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
                  disabled={showResult}
                  className={`text-base font-bold text-center transition-all outline-none ${
                    answerIsCorrect
                      ? 'bg-piku-mint text-gray-900 px-1.5 py-1'
                      : answerIsIncorrect
                      ? 'bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md'
                      : 'bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1'
                  }`}
                  style={{ width: `${Math.max(part.content.length * 10, 60)}px` }}
                />
                {answerIsIncorrect && (
                  <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-base font-bold rounded-r-md">
                    {part.content}
                  </span>
                )}
              </span>
            );
          }
        })}
      </div>

      {/* Mobile Actions */}
      <div className="lg:hidden flex justify-end gap-3">
        {!showResult ? (
          <div className="w-48">
            <ActionButton
              onClick={handleCheck}
              disabled={!allFilled}
              variant="purple"
              icon={<ActionButtonIcons.Check />}
            >
              Check Answer
            </ActionButton>
          </div>
        ) : (
          <div className="w-40">
            <ActionButton
              onClick={handleNext}
              variant="mint"
              icon={<ActionButtonIcons.ArrowRight />}
            >
              Next
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
