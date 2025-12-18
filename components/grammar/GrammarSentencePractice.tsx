'use client';

import { useState, useEffect, useRef } from 'react';
import { DifficultyButtons } from '@/components/flashcards/DifficultyButtons';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

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
  onComplete: (results: { sentenceId: string; difficulty: string }[]) => void;
}

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy' | 'expert';

export function GrammarSentencePractice({
  sentences,
  ruleTitle,
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
        // Only Enter to reveal answer (not spacebar)
        if (e.key === 'Enter') {
          if (userAnswer.trim()) {
            e.preventDefault();
            handleRevealAnswer();
          }
        }
      } else {
        // Number keys for difficulty
        if (e.key >= '1' && e.key <= '5') {
          e.preventDefault(); // Prevent the number from being typed into the next input
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
      <div className="bg-white shadow-sm p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">No sentences available</h3>
        <p className="text-gray-600">
          This grammar rule doesn't have practice sentences yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-semibold">{ruleTitle}</span>
          <span>
            {currentIndex + 1} / {sentences.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Practice Card */}
      <div className="bg-white shadow-sm overflow-hidden mb-6">
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
            <div className="mb-6 relative">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Capitalize first letter
                  if (newValue.length === 1) {
                    setUserAnswer(newValue.charAt(0).toUpperCase());
                  } else {
                    setUserAnswer(newValue);
                  }
                }}
                placeholder="Type your answer in German..."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 focus:outline-none focus:border-blue-600 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleRevealAnswer();
                  }
                }}
              />
              <GermanCharAutocomplete
                textareaRef={inputRef}
                content={userAnswer}
                onContentChange={setUserAnswer}
              />
            </div>
          )}

          {/* Correct Answer (revealed) */}
          {isRevealed && (
            <div className="mb-6">
              <div className="space-y-4">
                {/* Your Answer */}
                <div
                  className={`p-4 ${
                    isCorrect()
                      ? 'bg-emerald-100'
                      : 'bg-pink-100'
                  }`}
                >
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Your Answer</h5>
                  <div className="px-3 py-2 bg-white border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {userAnswer || '(no answer)'}
                    </p>
                  </div>
                </div>

                {/* Correct Answer */}
                {!isCorrect() && (
                  <div className="p-4 bg-blue-100">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Correct Answer</h5>
                    <div className="px-3 py-2 bg-white border border-gray-200">
                      <p className="text-sm font-bold text-gray-900">{currentSentence.german}</p>
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
                    <div className="max-w-xs mx-auto">
                      <ActionButton
                        onClick={() => {
                          setIsRevealed(false);
                          setUserAnswer('');
                        }}
                        icon={<ActionButtonIcons.ArrowRight />}
                        variant="orange"
                      >
                        Retry This Sentence
                      </ActionButton>
                    </div>
                  )}
                </div>
              </div>

              {/* Hints */}
              {currentSentence.hints && currentSentence.hints.length > 0 && (
                <div className="p-4 bg-amber-100">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">💡 Hints</h5>
                  <div className="space-y-2">
                    {currentSentence.hints.map((hint, index) => (
                      <div key={index} className="px-3 py-2 bg-white border border-gray-200">
                        <span className="text-sm text-gray-900">{hint}</span>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
}
