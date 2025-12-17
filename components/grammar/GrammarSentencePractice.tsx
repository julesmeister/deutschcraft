'use client';

import { useState, useEffect, useRef } from 'react';
import { DifficultyButtons } from '@/components/flashcards/DifficultyButtons';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface GrammarSentence {
  sentenceId: string;
  ruleId: string;
  english: string;
  german: string;
  hints?: string[];
  keywords?: string[];
  difficulty?: number;
}

interface GrammarSentencePracticeProps {
  sentences: GrammarSentence[];
  ruleTitle: string;
  onBack: () => void;
  onComplete: (results: { sentenceId: string; difficulty: string }[]) => void;
}

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy' | 'expert';

export function GrammarSentencePractice({
  sentences,
  ruleTitle,
  onBack,
  onComplete,
}: GrammarSentencePracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ sentenceId: string; difficulty: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSentence = sentences[currentIndex];
  const progress = ((currentIndex + 1) / sentences.length) * 100;

  // Focus input when component mounts or sentence changes
  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isRevealed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRevealed) {
        // Space or Enter to reveal answer
        if (e.key === ' ' || e.key === 'Enter') {
          if (userAnswer.trim()) {
            e.preventDefault();
            handleRevealAnswer();
          }
        }
      } else {
        // Number keys for difficulty
        if (e.key >= '1' && e.key <= '5') {
          const difficulties: DifficultyLevel[] = ['again', 'hard', 'good', 'easy', 'expert'];
          handleDifficulty(difficulties[parseInt(e.key) - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRevealed, userAnswer]);

  const handleRevealAnswer = () => {
    setIsRevealed(true);
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize spaces
  };

  const isCorrect = (): boolean => {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(currentSentence.german);
    return normalizedUser === normalizedCorrect;
  };

  const handleDifficulty = (difficulty: DifficultyLevel) => {
    // Record the result
    const newResults = [
      ...sessionResults,
      { sentenceId: currentSentence.sentenceId, difficulty },
    ];
    setSessionResults(newResults);

    // Move to next sentence or complete
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsRevealed(false);
    } else {
      // Session complete
      onComplete(newResults);
    }
  };

  if (!currentSentence) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">No sentences available</h3>
        <p className="text-gray-600 mb-6">
          This grammar rule doesn't have practice sentences yet.
        </p>
        <ActionButton onClick={onBack} icon={<ActionButtonIcons.ArrowRight />} variant="gray">
          Back to Rules
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-semibold">{ruleTitle}</span>
          <span>
            {currentIndex + 1} / {sentences.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Practice Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="p-8 sm:p-12">
          {/* English Prompt */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Translate to German
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-relaxed">
              {currentSentence.english}
            </p>
          </div>

          {/* Input Field */}
          {!isRevealed && (
            <div className="mb-6">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer in German..."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleRevealAnswer();
                  }
                }}
              />
            </div>
          )}

          {/* Correct Answer (revealed) */}
          {isRevealed && (
            <div className="mb-6">
              <div className="space-y-4">
                {/* Your Answer */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 mb-2">Your Answer</h5>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      isCorrect()
                        ? 'bg-green-50 border-2 border-green-300 text-green-900'
                        : 'bg-red-50 border-2 border-red-300 text-red-900'
                    }`}
                  >
                    <p className="text-lg font-medium">{userAnswer || '(no answer)'}</p>
                  </div>
                </div>

                {/* Correct Answer */}
                {!isCorrect() && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Correct Answer</h5>
                    <div className="px-4 py-3 rounded-lg bg-blue-50 border-2 border-blue-300">
                      <p className="text-lg font-bold text-blue-900">{currentSentence.german}</p>
                    </div>
                  </div>
                )}

                {/* Result Icon */}
                <div className="text-center py-4">
                  {isCorrect() ? (
                    <div className="inline-flex items-center gap-2 text-green-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xl font-bold">Correct!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-red-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xl font-bold">Try Again</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hints */}
              {currentSentence.hints && currentSentence.hints.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="text-sm font-semibold text-yellow-900 mb-2">💡 Hints</h5>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {currentSentence.hints.map((hint, index) => (
                      <li key={index}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Difficulty Buttons */}
        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200">
          <DifficultyButtons
            isFlipped={isRevealed}
            onDifficulty={handleDifficulty}
            onShowAnswer={handleRevealAnswer}
          />
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors"
        >
          ← Back to Rules
        </button>
      </div>
    </div>
  );
}
