/**
 * ReviewQuiz Component
 * Fill-in-the-blanks quiz for reviewing corrections
 */

'use client';

import { useState, useEffect } from 'react';
import { QuizBlank } from '@/lib/models/writing';
import { generateQuizBlanks, checkAnswer, calculateQuizScore } from '@/lib/utils/quizGenerator';
import { getDiff } from '@/lib/utils/textDiff';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface ReviewQuizProps {
  originalText: string;
  correctedText: string;
  sourceType: 'ai' | 'teacher' | 'reference';
  onComplete: (score: number, correctAnswers: number, totalBlanks: number, answers: Record<number, string>) => void;
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
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ score: number; correctAnswers: number; totalBlanks: number } | null>(null);

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

  const handleSubmit = () => {
    const quizResults = calculateQuizScore(answers, blanks);
    setResults(quizResults);
    setShowResults(true);
  };

  const handleFinish = () => {
    if (results) {
      onComplete(results.score, results.correctAnswers, results.totalBlanks, answers);
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

  return (
    <div className="space-y-8">
      {/* Quiz Header */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h3 className="text-lg font-bold text-gray-900">Review Quiz</h3>
          </div>
          {!showResults && (
            <div className="text-sm text-gray-600 font-medium">
              {blanks.length} {blanks.length === 1 ? 'blank' : 'blanks'} to fill
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Fill in the blanks with the corrected words from the {sourceType === 'teacher' ? "teacher's" : sourceType === 'ai' ? "AI" : "reference"} correction.
        </p>
      </div>

      {/* Quiz Content */}
      <div>
        <QuizText
          correctedText={correctedText}
          blanks={blanks}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          showResults={showResults}
          disabled={showResults}
        />
      </div>

      {/* Results */}
      {showResults && results && (
        <div className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">
              {results.score >= 80 ? '🎉' : results.score >= 60 ? '👍' : '💪'}
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Score: {results.score}%
              </h3>
              <p className="text-sm text-gray-600">
                {results.correctAnswers} out of {results.totalBlanks} correct
              </p>
            </div>
          </div>
          {results.score >= 80 ? (
            <p className="text-sm text-gray-700">Excellent work! You've mastered these corrections.</p>
          ) : results.score >= 60 ? (
            <p className="text-sm text-gray-700">Good effort! Review the highlighted corrections and try again.</p>
          ) : (
            <p className="text-sm text-gray-700">Keep practicing! Review the corrections carefully.</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        {!showResults ? (
          <>
            <div className="flex-1">
              <ActionButton
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== blanks.length}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
              >
                Submit Answers
              </ActionButton>
            </div>
            <div className="w-40">
              <ActionButton onClick={onCancel} variant="gray" icon={<ActionButtonIcons.X />}>
                Cancel
              </ActionButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <ActionButton onClick={handleFinish} variant="mint" icon={<ActionButtonIcons.Check />}>
                Finish & Save Score
              </ActionButton>
            </div>
            <div className="w-40">
              <ActionButton
                onClick={() => {
                  setAnswers({});
                  setShowResults(false);
                  setResults(null);
                }}
                variant="cyan"
                icon={<ActionButtonIcons.Play />}
              >
                Try Again
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * QuizText Component
 * Displays text with input fields for blanks
 */
interface QuizTextProps {
  correctedText: string;
  blanks: QuizBlank[];
  answers: Record<number, string>;
  onAnswerChange: (blankIndex: number, value: string) => void;
  showResults: boolean;
  disabled: boolean;
}

function QuizText({ correctedText, blanks, answers, onAnswerChange, showResults, disabled }: QuizTextProps) {
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankIndex?: number }> = [];
  let lastPosition = 0;

  // Sort blanks by position
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  for (const blank of sortedBlanks) {
    // Add text before the blank
    if (blank.position > lastPosition) {
      parts.push({
        type: 'text',
        content: correctedText.substring(lastPosition, blank.position)
      });
    }

    // Add the blank
    parts.push({
      type: 'blank',
      content: blank.correctAnswer,
      blankIndex: blank.index
    });

    lastPosition = blank.position + blank.correctAnswer.length;
  }

  // Add remaining text
  if (lastPosition < correctedText.length) {
    parts.push({
      type: 'text',
      content: correctedText.substring(lastPosition)
    });
  }

  return (
    <div className="text-xl leading-relaxed"
         style={{
           lineHeight: '2.5',
           fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
         }}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index} className="text-gray-900">{part.content}</span>;
        } else {
          const blankIndex = part.blankIndex!;
          const studentAnswer = answers[blankIndex] || '';
          const isCorrect = showResults && checkAnswer(studentAnswer, part.content);
          const isIncorrect = showResults && !checkAnswer(studentAnswer, part.content);

          return (
            <span key={index} className="inline-block mx-1">
              <input
                type="text"
                value={studentAnswer}
                onChange={(e) => onAnswerChange(blankIndex, e.target.value)}
                disabled={disabled}
                placeholder={`(${part.content.length})`}
                className={`px-3 py-1 border-b-2 bg-transparent rounded-none text-base font-medium text-center transition-all outline-none ${
                  isCorrect
                    ? 'border-green-500 text-green-900'
                    : isIncorrect
                    ? 'border-red-500 text-red-900'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                style={{ width: `${Math.max(part.content.length * 12, 80)}px` }}
              />
              {showResults && isIncorrect && (
                <span className="ml-2 text-sm text-green-700">
                  → {part.content}
                </span>
              )}
            </span>
          );
        }
      })}
    </div>
  );
}
