'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock flashcard data (will be replaced with real data from Firebase)
const MOCK_FLASHCARDS = [
  {
    id: '1',
    question: 'What is the German word for "hello"?',
    correctAnswer: 'Hallo',
    wrongAnswers: ['Gut', 'Danke', 'Tschüss'],
    type: 'multiple-choice' as const,
    level: 'A1' as const,
  },
  {
    id: '2',
    question: 'Translate: "Good morning"',
    correctAnswer: 'Guten Morgen',
    wrongAnswers: ['Guten Tag', 'Gute Nacht', 'Guten Abend'],
    type: 'multiple-choice' as const,
    level: 'A1' as const,
  },
  {
    id: '3',
    question: 'What does "Danke" mean?',
    correctAnswer: 'Thank you',
    wrongAnswers: ['Please', 'Sorry', 'Yes'],
    type: 'multiple-choice' as const,
    level: 'A1' as const,
  },
  {
    id: '4',
    question: 'How do you say "water" in German?',
    correctAnswer: 'Wasser',
    wrongAnswers: ['Brot', 'Milch', 'Kaffee'],
    type: 'multiple-choice' as const,
    level: 'A1' as const,
  },
  {
    id: '5',
    question: 'Translate: "I am learning German"',
    correctAnswer: 'Ich lerne Deutsch',
    wrongAnswers: ['Ich spreche Deutsch', 'Ich verstehe Deutsch', 'Ich mag Deutsch'],
    type: 'multiple-choice' as const,
    level: 'A2' as const,
  },
];

export default function FlashcardsPage() {
  const { session } = useFirebaseAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState<'practice' | 'complete'>('practice');

  const currentCard = MOCK_FLASHCARDS[currentCardIndex];
  const allAnswers = currentCard ? [...currentCard.wrongAnswers, currentCard.correctAnswer].sort(() => Math.random() - 0.5) : [];
  const progress = ((currentCardIndex + 1) / MOCK_FLASHCARDS.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return; // Prevent changing answer after submission

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentCard.correctAnswer;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < MOCK_FLASHCARDS.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsFlipped(false);
    } else {
      setMode('complete');
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMode('practice');
  };

  if (mode === 'complete') {
    const accuracyRate = Math.round((correctCount / MOCK_FLASHCARDS.length) * 100);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900">Practice Complete! 🎉</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-12 text-center space-y-8">
            <div className="text-8xl mb-4">
              {accuracyRate >= 80 ? '🏆' : accuracyRate >= 60 ? '👏' : '📚'}
            </div>

            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">{accuracyRate}% Accuracy</h2>
              <p className="text-gray-600">
                {accuracyRate >= 80 ? 'Excellent work!' : accuracyRate >= 60 ? 'Good job! Keep practicing.' : 'Keep going! Practice makes perfect.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <div className="text-3xl font-black text-gray-900">{MOCK_FLASHCARDS.length}</div>
                <div className="text-sm text-gray-500 mt-1">Total Cards</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-600">{correctCount}</div>
                <div className="text-sm text-gray-500 mt-1">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-black text-red-600">{incorrectCount}</div>
                <div className="text-sm text-gray-500 mt-1">Incorrect</div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={handleRestart} className="flex-1">
                Practice Again
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/student'} variant="outline" className="flex-1">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Flashcard Practice</h1>
          <p className="text-gray-500">Master German vocabulary with spaced repetition</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-gray-900">
            {currentCardIndex + 1} / {MOCK_FLASHCARDS.length}
          </div>
          <div className="text-sm text-gray-500">Cards completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-piku-purple-dark to-piku-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Score Display */}
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
          <span className="text-2xl">✅</span>
          <div>
            <div className="text-xl font-black text-emerald-600">{correctCount}</div>
            <div className="text-xs text-emerald-700">Correct</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          <span className="text-2xl">❌</span>
          <div>
            <div className="text-xl font-black text-red-600">{incorrectCount}</div>
            <div className="text-xs text-red-700">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 md:p-12">
              {/* Level Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 bg-piku-purple-light/30 text-piku-purple-dark px-4 py-2 rounded-full text-sm font-bold">
                  <span>🎯</span>
                  Level {currentCard.level}
                </span>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  {currentCard.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAnswers.map((answer, index) => {
                  const isSelected = selectedAnswer === answer;
                  const isCorrect = answer === currentCard.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showIncorrect = showResult && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(answer)}
                      disabled={showResult}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        showCorrect
                          ? 'bg-emerald-50 border-emerald-500'
                          : showIncorrect
                          ? 'bg-red-50 border-red-500'
                          : isSelected
                          ? 'bg-piku-purple-light/30 border-piku-purple-dark'
                          : 'bg-white border-gray-200 hover:border-piku-purple-dark hover:bg-gray-50'
                      } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">{answer}</span>
                        {showCorrect && <span className="text-2xl">✅</span>}
                        {showIncorrect && <span className="text-2xl">❌</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <div
                    className={`p-6 rounded-xl ${
                      selectedAnswer === currentCard.correctAnswer
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">
                        {selectedAnswer === currentCard.correctAnswer ? '🎉' : '💡'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-lg mb-2">
                          {selectedAnswer === currentCard.correctAnswer
                            ? 'Correct!'
                            : 'Not quite!'}
                        </h3>
                        {selectedAnswer !== currentCard.correctAnswer && (
                          <p className="text-gray-700">
                            The correct answer is: <span className="font-bold">{currentCard.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleNext} size="lg">
                      {currentCardIndex < MOCK_FLASHCARDS.length - 1 ? 'Next Card' : 'Finish'}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-sm text-gray-400">
        Tip: You can use number keys 1-4 to select answers quickly
      </div>
    </div>
  );
}
