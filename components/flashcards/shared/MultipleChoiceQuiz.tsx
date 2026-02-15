"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameStats } from "./types";

export interface QuizItem {
  id: string;
  prompt: string;
  /** Secondary text shown below the prompt (e.g. root word) */
  subtitle?: string;
  correctAnswer: string;
  choices: string[];
  meta?: {
    rule?: string;
    examples?: string[];
  };
}

interface MultipleChoiceQuizProps {
  items: QuizItem[];
  onAnswer: (item: QuizItem, selectedAnswer: string, isCorrect: boolean) => void;
  onComplete: (stats: GameStats) => void;
  /** Color map for choice buttons: answer value -> tailwind classes */
  choiceColors?: Record<string, { bg: string; text: string; ring: string }>;
  /** Max questions per round (0 = all items) */
  maxQuestions?: number;
}

type FeedbackState = "correct" | "wrong" | null;

export function MultipleChoiceQuiz({
  items,
  onAnswer,
  onComplete,
  choiceColors,
  maxQuestions = 0,
}: MultipleChoiceQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalQuestions = maxQuestions > 0 ? Math.min(maxQuestions, items.length) : items.length;
  const currentItem = items[currentIndex];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setStats(prev => {
        onComplete(prev);
        return prev;
      });
      return;
    }
    setDirection(1);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setFeedback(null);
      setSelectedAnswer(null);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, totalQuestions, onComplete]);

  const handleSelect = useCallback((answer: string) => {
    if (feedback !== null || isTransitioning) return;

    const isCorrect = answer === currentItem.correctAnswer;
    setSelectedAnswer(answer);
    setFeedback(isCorrect ? "correct" : "wrong");

    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const streakBonus = isCorrect ? Math.floor(newStreak / 3) * 5 : 0;
      return {
        score: prev.score + (isCorrect ? 10 + streakBonus : 0),
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
    });

    onAnswer(currentItem, answer, isCorrect);

    timeoutRef.current = setTimeout(() => {
      advanceToNext();
    }, isCorrect ? 1200 : 1800);
  }, [feedback, isTransitioning, currentItem, onAnswer, advanceToNext]);

  const getChoiceStyle = (choice: string) => {
    if (feedback === null) {
      return `bg-white text-gray-900 border border-gray-300 hover:border-gray-900 hover:scale-105 cursor-pointer shadow-sm`;
    }

    if (choice === currentItem.correctAnswer) {
      return `bg-green-50 border-2 border-green-500 text-green-700 scale-105`;
    }
    if (choice === selectedAnswer && feedback === "wrong") {
      return `bg-red-50 border-2 border-red-400 text-red-500 scale-95 opacity-70`;
    }
    return `bg-white text-gray-300 border border-gray-200 opacity-50`;
  };

  if (!currentItem) return null;

  const progress = ((currentIndex + (feedback ? 1 : 0)) / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress bar — on top */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] sm:text-xs text-gray-400">{currentIndex + 1} of {totalQuestions}</span>
          <span className="text-[10px] sm:text-xs text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gray-900 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quiz + Score side by side */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-stretch">

        {/* Quiz card — takes remaining space */}
        <div className="flex-1 min-w-0 flex">
          <AnimatePresence mode="wait" custom={direction}>
            {!isTransitioning && (
              <motion.div
                key={currentItem.id}
                custom={direction}
                initial={{ opacity: 0, x: 80 * direction, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -80 * direction, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 overflow-hidden shadow-sm w-full flex flex-col justify-center ${
                  currentItem.choices.length > 3 ? 'h-[300px] sm:h-[340px]' : 'h-[220px] sm:h-[240px]'
                }`}
              >
                {/* Prompt + choices row */}
                <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-8">
                  {/* Left: word/prompt */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex-1 flex items-center justify-center sm:pl-4 md:pl-8"
                  >
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                        {currentItem.prompt}
                      </div>
                      {currentItem.subtitle && (
                        <div className="text-sm sm:text-base text-gray-400 mt-0.5">
                          {currentItem.subtitle}
                        </div>
                      )}
                      {/* Fixed-height slot so feedback swaps in without shifting layout */}
                      <div className="h-10 sm:h-12 flex items-start mt-1">
                        <AnimatePresence mode="wait">
                          {feedback ? (
                            <motion.div
                              key="feedback"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {feedback === "correct" ? (
                                <>
                                  <div className="text-green-600 font-bold text-sm sm:text-base">Correct!</div>
                                  {currentItem.meta?.rule && (
                                    <div className="text-gray-400 text-xs">{currentItem.meta.rule}</div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="text-red-500 font-bold text-sm sm:text-base">
                                    It&apos;s <span className="text-green-600">{currentItem.correctAnswer}</span>
                                  </div>
                                  {currentItem.meta?.rule && (
                                    <div className="text-gray-400 text-xs">{currentItem.meta.rule}</div>
                                  )}
                                </>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="hint"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {currentItem.meta?.examples && currentItem.meta.examples.length > 0 && (
                                <div className="text-xs sm:text-sm text-gray-400">
                                  e.g. {currentItem.meta.examples[0].replace(/^(der|die|das)\s+/i, '')}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right: choices */}
                  <div className="flex flex-col gap-2 sm:gap-3 sm:min-w-[180px]">
                    {currentItem.choices.map((choice, i) => (
                      <motion.button
                        key={choice}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.3, ease: "easeOut" }}
                        onClick={() => handleSelect(choice)}
                        disabled={feedback !== null}
                        className={`
                          relative px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg
                          transition-all duration-200 text-center
                          ${getChoiceStyle(choice)}
                        `}
                      >
                        {feedback && choice === currentItem.correctAnswer && (
                          <motion.span
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="absolute -right-1 -top-1 bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs"
                          >
                            ✓
                          </motion.span>
                        )}
                        {feedback === "wrong" && choice === selectedAnswer && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-1 -top-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs"
                          >
                            ✗
                          </motion.span>
                        )}
                        {choice}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Score panel — right side on desktop, below on mobile */}
        <div className="md:w-[140px] shrink-0 flex">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 md:p-5 w-full flex md:flex-col items-center md:items-stretch justify-center gap-3 md:gap-0 md:justify-evenly">

            {/* Score */}
            <div className="text-center flex-1 md:flex-none">
              <motion.div
                key={`score-${stats.score}`}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className="text-2xl md:text-3xl font-black text-gray-900"
              >
                {stats.score}
              </motion.div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Score</div>
            </div>

            <div className="hidden md:block w-full h-px bg-gray-100" />
            <div className="md:hidden w-px h-8 bg-gray-100 self-center" />

            {/* Correct */}
            <div className="text-center flex-1 md:flex-none">
              <motion.div
                key={`correct-${stats.correct}`}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className="text-lg md:text-xl font-black text-green-600"
              >
                {stats.correct}
              </motion.div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Correct</div>
            </div>

            <div className="hidden md:block w-full h-px bg-gray-100" />
            <div className="md:hidden w-px h-8 bg-gray-100 self-center" />

            {/* Wrong */}
            <div className="text-center flex-1 md:flex-none">
              <motion.div
                key={`wrong-${stats.incorrect}`}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className="text-lg md:text-xl font-black text-red-500"
              >
                {stats.incorrect}
              </motion.div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Wrong</div>
            </div>

            <div className="hidden md:block w-full h-px bg-gray-100" />
            <div className="md:hidden w-px h-8 bg-gray-100 self-center" />

            {/* Streak */}
            <div className="text-center flex-1 md:flex-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`streak-${stats.streak}`}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-lg md:text-xl font-black ${stats.streak >= 3 ? 'text-gray-900' : 'text-gray-300'}`}
                >
                  {stats.streak}
                </motion.div>
              </AnimatePresence>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Streak</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
