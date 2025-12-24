/**
 * ReviewQuiz Component
 * Fill-in-the-blanks quiz for reviewing corrections
 * Shows one blank at a time like the quiz page
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { QuizBlank } from '@/lib/models/writing';
import { generateQuizBlanks, checkAnswer, calculateQuizScore } from '@/lib/utils/quizGenerator';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { calculateQuizPoints } from '@/lib/hooks/useQuizStats';
import { GermanCharAutocomplete } from './GermanCharAutocomplete';

interface ReviewQuizProps {
  originalText: string;
  correctedText: string;
  sourceType: 'ai' | 'teacher' | 'reference';
  onComplete: (points: number, correctAnswers: number, totalBlanks: number, answers: Record<number, string>) => void;
  onCancel: () => void;
}

export function ReviewQuiz({
  originalText,
  correctedText,
  sourceType,
  onComplete,
  onCancel
}: ReviewQuizProps) {
  const [blanks, setBlanks] = useState<QuizBlank[]>([]);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ points: number; correctAnswers: number; totalBlanks: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Generate quiz blanks on mount
    const generatedBlanks = generateQuizBlanks(originalText, correctedText);
    setBlanks(generatedBlanks);
  }, [originalText, correctedText]);

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const handleNext = () => {
    if (currentBlankIndex < blanks.length - 1) {
      setCurrentBlankIndex(currentBlankIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentBlankIndex > 0) {
      setCurrentBlankIndex(currentBlankIndex - 1);
    }
  };

  const handleSubmit = () => {
    const quizResults = calculateQuizScore(answers, blanks);
    const points = calculateQuizPoints(quizResults.correctAnswers, quizResults.totalBlanks);
    setResults({
      points,
      correctAnswers: quizResults.correctAnswers,
      totalBlanks: quizResults.totalBlanks
    });
    setShowResults(true);
    setCurrentBlankIndex(0); // Reset to first blank for review
  };

  const handleFinish = () => {
    if (results) {
      onComplete(results.points, results.correctAnswers, results.totalBlanks, answers);
    }
  };

  if (blanks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No corrections to review!</h3>
        <p className="text-sm text-gray-600 mb-6">
          Your {sourceType === 'teacher' ? "teacher's" : sourceType === 'ai' ? "AI" : "reference"} correction had no changes from your original text.
        </p>
        <div className="max-w-xs mx-auto mb-8">
          <ActionButton onClick={onCancel} variant="gray" icon={<ActionButtonIcons.ArrowRight />}>
            Back to Review
          </ActionButton>
        </div>
      </div>
    );
  }

  const currentBlank = blanks[currentBlankIndex];
  const allBlanksFilled = blanks.every((blank) => (answers[blank.index] || '').trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {showResults ? 'Quiz Results' : 'Review Quiz'}
            </h3>
            <p className="text-sm text-gray-600">
              {showResults
                ? `You earned ${results?.points} points • ${results?.correctAnswers}/${results?.totalBlanks} correct`
                : `Fill in the blanks with the corrected words from the ${sourceType === 'teacher' ? "teacher's" : sourceType === 'ai' ? "AI" : "reference"} correction.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Current Blank */}
      <div className="pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">
            {currentBlankIndex + 1}
          </span>
          <span className="text-xs text-gray-500">
            Question {currentBlankIndex + 1} of {blanks.length}
          </span>
        </div>

        {/* Display the sentence with the blank */}
        <BlankQuestion
          correctedText={correctedText}
          blank={currentBlank}
          answer={answers[currentBlank.index] || ''}
          onAnswerChange={(value) => handleAnswerChange(currentBlank.index, value)}
          showResults={showResults}
          inputRef={inputRef}
        />
      </div>

      {/* Navigation & Actions */}
      {!showResults ? (
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentBlankIndex === 0}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentBlankIndex < blanks.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-purple to-pastel-ocean rounded-lg hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          ) : (
            <ActionButton
              onClick={handleSubmit}
              disabled={!allBlanksFilled}
              variant="purple"
              icon={<ActionButtonIcons.Check />}
              className="flex-1"
            >
              Check Answers
            </ActionButton>
          )}

          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentBlankIndex === 0}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentBlankIndex === blanks.length - 1}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>

          <div className="flex-1" />

          <ActionButton
            onClick={handleFinish}
            variant="mint"
            icon={<ActionButtonIcons.Check />}
            className="min-w-[180px]"
          >
            Finish & Save Score
          </ActionButton>
        </div>
      )}
    </div>
  );
}

/**
 * BlankQuestion Component
 * Displays a single blank question with context
 */
interface BlankQuestionProps {
  correctedText: string;
  blank: QuizBlank;
  answer: string;
  onAnswerChange: (value: string) => void;
  showResults: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

function BlankQuestion({
  correctedText,
  blank,
  answer,
  onAnswerChange,
  showResults,
  inputRef
}: BlankQuestionProps) {
  const parts: Array<{ type: 'text' | 'blank'; content: string }> = [];

  // Add text before blank
  if (blank.position > 0) {
    parts.push({
      type: 'text',
      content: correctedText.substring(0, blank.position),
    });
  }

  // Add blank
  parts.push({
    type: 'blank',
    content: blank.correctAnswer,
  });

  // Add remaining text
  // Skip past the word AND any trailing punctuation
  let endPosition = blank.position + blank.correctAnswer.length;
  // Skip punctuation that was part of the original word
  while (endPosition < correctedText.length && /[^\w\s]/.test(correctedText[endPosition])) {
    endPosition++;
  }

  if (endPosition < correctedText.length) {
    parts.push({
      type: 'text',
      content: correctedText.substring(endPosition),
    });
  }

  const isCorrect = showResults && checkAnswer(answer, blank.correctAnswer);
  const isIncorrect = showResults && !checkAnswer(answer, blank.correctAnswer);

  return (
    <div className="text-base leading-relaxed">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index} className="text-gray-900">{part.content}</span>;
        } else {
          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1 my-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={showResults}
                className={`text-sm font-bold text-center transition-all outline-none ${
                  isCorrect
                    ? 'bg-piku-mint text-gray-900 px-1.5 py-1 rounded-md'
                    : isIncorrect
                    ? 'bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md'
                    : 'bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1'
                }`}
                style={{ width: `${Math.max(part.content.length * 9, 50)}px` }}
              />
              {!showResults && inputRef.current && (
                <GermanCharAutocomplete
                  textareaRef={{ current: inputRef.current }}
                  content={answer}
                  onContentChange={onAnswerChange}
                />
              )}
              {isIncorrect && (
                <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-sm font-bold rounded-r-md">
                  {part.content}
                </span>
              )}
            </span>
          );
        }
      })}
    </div>
  );
}
