"use client";

import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import confetti from "canvas-confetti";
import {
  PrepositionEntry, FloatingCase, CASES, PREPOSITION_DATA,
  LANE_COUNT, PACMAN_X, CASE_SPAWN_X, BASE_SPEED, SPEED_INCREMENT, MAX_CASES,
  getCaseColor, getCaseTextColor,
} from "./prepositioncases/data";
import { GameStats } from "./shared/types";
import { MenuScreen } from "./prepositioncases/MenuScreen";
import { ReviewScreen } from "./prepositioncases/ReviewScreen";
import { AnsweredPrepositionsList } from "./prepositioncases/AnsweredPrepositionsList";
import { StatsBar } from "./pacman/StatsBar";
import { PausedScreen } from "./pacman/PausedScreen";
import { SummaryScreen } from "./pacman/SummaryScreen";
import { MultipleChoiceQuiz, QuizItem } from "./shared/MultipleChoiceQuiz";
import { usePrepositionCasesProgress } from "@/lib/hooks/usePrepositionCasesProgress";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { saveDailyProgress } from "@/lib/services/turso";
import { weightedRandomPick } from "@/lib/utils/weightedRandom";
import { usePacmanControls } from "./shared/usePacmanControls";
import { useGameLoop } from "./shared/useGameLoop";
import { PacmanCharacter } from "./shared/PacmanCharacter";
import { LaneGuides } from "./shared/LaneGuides";
import { ControlsHint } from "./shared/ControlsHint";

export interface PrepositionCasesGameRef {
  endGame: () => void;
  reviewPrepositions: () => void;
}

interface PrepositionCasesGameProps {
  onBack: () => void;
  onGameStateChange?: (state: string) => void;
}

export const PrepositionCasesGame = forwardRef<PrepositionCasesGameRef, PrepositionCasesGameProps>(
  function PrepositionCasesGame({ onBack, onGameStateChange }, ref) {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'quiz' | 'paused' | 'summary' | 'review'>('menu');
    const [pacmanLane, setPacmanLane] = useState(1);
    const [floatingCases, setFloatingCases] = useState<FloatingCase[]>([]);
    const [currentPrep, setCurrentPrep] = useState<PrepositionEntry | null>(null);
    const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    const [level, setLevel] = useState(1);
    const [showCorrectFlash, setShowCorrectFlash] = useState(false);
    const [showWrongFlash, setShowWrongFlash] = useState(false);
    const [showWordReveal, setShowWordReveal] = useState(false);
    const [revealedPrep, setRevealedPrep] = useState<PrepositionEntry | null>(null);
    const [collisionPhase, setCollisionPhase] = useState<'start' | 'moving' | 'combined' | null>(null);
    const [answeredPreps, setAnsweredPreps] = useState<PrepositionEntry[]>([]);
    const answeredPrepsRef = useRef<Set<string>>(new Set());
    const mistakeCountsRef = useRef<Record<string, number>>({});
    const { progressMap, recordCorrect } = usePrepositionCasesProgress();
    const { session } = useFirebaseAuth();
    const userId = session?.user?.email || null;

    const { pacmanMouthOpen, gameAreaRef, handleTouchStart, handleTouchMove, handleTouchEnd } =
      usePacmanControls(gameState, LANE_COUNT, pacmanLane, setPacmanLane, setGameState);

    const endGame = useCallback(() => {
      setGameState('summary');
      if (userId && (stats.correct > 0 || stats.incorrect > 0)) {
        saveDailyProgress(userId, {
          cardsReviewed: stats.correct + stats.incorrect,
          correctCount: stats.correct,
          incorrectCount: stats.incorrect,
          timeSpent: 0,
        }).catch((err) => console.error("[PrepositionCasesGame] Failed to save daily progress:", err));
      }
    }, [userId, stats]);
    const reviewPrepositions = useCallback(() => setGameState('review'), []);
    useImperativeHandle(ref, () => ({ endGame, reviewPrepositions }), [endGame, reviewPrepositions]);

    useEffect(() => {
      onGameStateChange?.(gameState);
    }, [gameState, onGameStateChange]);

    const caseCountRef = useRef(0);
    const showWordRevealRef = useRef(false);
    const catchProcessingRef = useRef(false);

    const getRandomPrep = useCallback(() => {
      let pool = PREPOSITION_DATA.filter(p => !answeredPrepsRef.current.has(p.german));
      if (pool.length === 0) {
        answeredPrepsRef.current.clear();
        setAnsweredPreps([]);
        pool = PREPOSITION_DATA;
      }
      return weightedRandomPick(pool, p => p.german, progressMap, mistakeCountsRef.current);
    }, [progressMap]);

    const spawnCase = useCallback(() => {
      if (!currentPrep) return;
      if (caseCountRef.current >= MAX_CASES) return;

      setFloatingCases(prev => {
        const occupiedLanes = new Set(prev.filter(a => a.x > 70).map(a => a.lane));
        const availableLanes = Array.from({ length: LANE_COUNT }, (_, i) => i)
          .filter(lane => !occupiedLanes.has(lane));
        if (availableLanes.length === 0) return prev;

        const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        const speed = BASE_SPEED + (level - 1) * SPEED_INCREMENT;
        // ~30% chance of correct since 4 options
        const isCorrect = Math.random() < 0.3;
        const wrongCases = CASES.filter(c => c !== currentPrep.case);
        const caseLabel = isCorrect
          ? currentPrep.case
          : wrongCases[Math.floor(Math.random() * wrongCases.length)];

        caseCountRef.current = prev.length + 1;
        return [...prev, {
          id: `${caseLabel}-${Date.now()}-${Math.random()}`,
          caseLabel, lane, x: CASE_SPAWN_X, speed,
          isCorrect: caseLabel === currentPrep.case,
        }];
      });
    }, [currentPrep, level]);

    const fireConfetti = useCallback(() => {
      confetti({
        particleCount: 80, spread: 60,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#3B82F6', '#22C55E', '#8B5CF6', '#F97316'],
      });
    }, []);

    const handleCatch = useCallback((item: FloatingCase) => {
      if (catchProcessingRef.current) return;
      catchProcessingRef.current = true;
      setTimeout(() => { catchProcessingRef.current = false; }, 50);

      if (item.isCorrect && currentPrep) {
        setShowCorrectFlash(true);
        setTimeout(() => setShowCorrectFlash(false), 500);

        const streakBonus = Math.floor(stats.streak / 3) * 5;
        setStats(prev => ({
          ...prev,
          score: prev.score + 10 + streakBonus,
          correct: prev.correct + 1,
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
        }));

        if ((stats.correct + 1) % 5 === 0) setLevel(l => l + 1);

        if (!answeredPrepsRef.current.has(currentPrep.german)) {
          answeredPrepsRef.current.add(currentPrep.german);
          setAnsweredPreps(prev => [...prev, currentPrep]);
        }
        recordCorrect({ german: currentPrep.german, case: currentPrep.case });

        setFloatingCases([]);
        caseCountRef.current = 0;
        setRevealedPrep(currentPrep);
        setShowWordReveal(true);
        showWordRevealRef.current = true;
        setCollisionPhase('start');

        setTimeout(() => setCollisionPhase('moving'), 50);
        setTimeout(() => { setCollisionPhase('combined'); fireConfetti(); }, 900);
        setTimeout(() => {
          setShowWordReveal(false);
          showWordRevealRef.current = false;
          setCollisionPhase(null);
          setRevealedPrep(null);
          setCurrentPrep(getRandomPrep());
        }, 2800);
      } else {
        setShowWrongFlash(true);
        setTimeout(() => setShowWrongFlash(false), 300);
        setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
        if (currentPrep) {
          mistakeCountsRef.current[currentPrep.german] = (mistakeCountsRef.current[currentPrep.german] || 0) + 1;
        }
      }
    }, [stats, fireConfetti, getRandomPrep, currentPrep, recordCorrect]);

    // Game loop (shared hook)
    useGameLoop(gameState, pacmanLane, PACMAN_X, setFloatingCases, caseCountRef, handleCatch);

    // Spawn cases
    useEffect(() => {
      if (gameState !== 'playing' || !currentPrep) return;
      if (showWordRevealRef.current) return;
      spawnCase();
      const spawnInterval = Math.max(800 - (level * 50), 400);
      const intervalId = setInterval(() => {
        if (!showWordRevealRef.current) spawnCase();
      }, spawnInterval);
      return () => clearInterval(intervalId);
    }, [gameState, currentPrep, spawnCase, level]);

    const startGame = () => {
      setGameState('playing');
      setStats({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
      setLevel(1);
      setPacmanLane(1);
      setFloatingCases([]);
      caseCountRef.current = 0;
      answeredPrepsRef.current.clear();
      mistakeCountsRef.current = {};
      setAnsweredPreps([]);
      setCurrentPrep(getRandomPrep());
    };

    // --- Quiz mode ---
    const quizItems = useMemo<QuizItem[]>(() => {
      const shuffled = [...PREPOSITION_DATA].sort(() => Math.random() - 0.5);
      return shuffled.map(entry => ({
        id: entry.german,
        prompt: entry.german,
        subtitle: entry.english,
        correctAnswer: entry.case,
        choices: [...CASES],
        meta: { examples: [entry.example] },
      }));
    }, []);

    const caseChoiceColors: Record<string, { bg: string; text: string; ring: string }> = {
      Akkusativ: { bg: "bg-blue-600/80", text: "text-blue-100", ring: "ring-blue-400" },
      Dativ: { bg: "bg-green-600/80", text: "text-green-100", ring: "ring-green-400" },
      Both: { bg: "bg-purple-600/80", text: "text-purple-100", ring: "ring-purple-400" },
      Genitiv: { bg: "bg-orange-600/80", text: "text-orange-100", ring: "ring-orange-400" },
    };

    const startQuiz = () => {
      setGameState('quiz');
      answeredPrepsRef.current.clear();
      mistakeCountsRef.current = {};
      setAnsweredPreps([]);
    };

    const handleQuizAnswer = useCallback((item: QuizItem, _selectedAnswer: string, isCorrect: boolean) => {
      const entry = PREPOSITION_DATA.find(p => p.german === item.id);
      if (!entry) return;

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

      if (isCorrect) {
        if (!answeredPrepsRef.current.has(entry.german)) {
          answeredPrepsRef.current.add(entry.german);
          setAnsweredPreps(prev => [...prev, entry]);
        }
        recordCorrect({ german: entry.german, case: entry.case });
      } else {
        mistakeCountsRef.current[entry.german] = (mistakeCountsRef.current[entry.german] || 0) + 1;
      }
    }, [recordCorrect]);

    const handleQuizComplete = useCallback((finalStats: GameStats) => {
      setStats(finalStats);
      setGameState('summary');
      if (userId && (finalStats.correct > 0 || finalStats.incorrect > 0)) {
        saveDailyProgress(userId, {
          cardsReviewed: finalStats.correct + finalStats.incorrect,
          correctCount: finalStats.correct,
          incorrectCount: finalStats.incorrect,
          timeSpent: 0,
        }).catch((err) => console.error("[PrepositionCasesGame] Failed to save daily progress:", err));
      }
    }, [userId]);

    // --- Non-playing screens ---
    if (gameState === 'menu') {
      return <MenuScreen onStart={startGame} onStartQuiz={startQuiz} onReview={() => setGameState('review')} />;
    }
    if (gameState === 'quiz') {
      return (
        <div>
          <MultipleChoiceQuiz
            items={quizItems}
            onAnswer={handleQuizAnswer}
            onComplete={handleQuizComplete}
            choiceColors={caseChoiceColors}
            maxQuestions={20}
          />
          <AnsweredPrepositionsList answeredPrepositions={answeredPreps} progressMap={progressMap} />
        </div>
      );
    }
    if (gameState === 'summary') {
      return (
        <div>
          <SummaryScreen stats={stats} onPlayAgain={startGame} onBack={onBack} />
          <AnsweredPrepositionsList answeredPrepositions={answeredPreps} progressMap={progressMap} />
        </div>
      );
    }
    if (gameState === 'paused') {
      return (
        <div>
          <PausedScreen onResume={() => setGameState('playing')} onRestart={startGame} onQuit={onBack} />
          <AnsweredPrepositionsList answeredPrepositions={answeredPreps} progressMap={progressMap} />
        </div>
      );
    }
    if (gameState === 'review') {
      return <ReviewScreen onBack={() => setGameState('menu')} onStart={startGame} />;
    }

    // --- Playing screen ---
    const laneHeight = 100 / LANE_COUNT;
    const pacmanTop = pacmanLane * laneHeight + laneHeight / 2;

    return (
      <div>
        <StatsBar stats={stats} level={level} onPause={() => setGameState('paused')} />

        {/* Game area */}
        <div
          ref={gameAreaRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-200 touch-none ${
            showCorrectFlash ? 'ring-4 ring-green-500' : ''
          } ${showWrongFlash ? 'ring-4 ring-red-500' : ''}`}
          style={{ height: 'clamp(280px, 50vh, 400px)' }}
        >
          {/* Background preposition */}
          {currentPrep && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-20 px-4">
                <div className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-2">
                  {currentPrep.german}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-gray-300">
                  {currentPrep.english}
                </div>
              </div>
            </div>
          )}

          <LaneGuides laneCount={LANE_COUNT} />

          {/* Floating cases */}
          {floatingCases.map(fc => (
            <div
              key={fc.id}
              className="absolute transition-none z-10"
              style={{
                left: `${fc.x}%`,
                top: `${fc.lane * laneHeight + laneHeight / 2}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-black text-xs sm:text-sm shadow-lg whitespace-nowrap bg-gradient-to-r ${getCaseColor(fc.caseLabel)} text-white`}>
                {fc.caseLabel}
              </div>
            </div>
          ))}

          {/* Pacman */}
          <div
            className="absolute transition-all duration-100 ease-out z-20"
            style={{
              left: `${PACMAN_X}%`,
              top: `${pacmanTop}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <PacmanCharacter mouthOpen={pacmanMouthOpen} />
          </div>

          {/* Target info */}
          {currentPrep && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                <div className="text-[10px] sm:text-xs text-gray-400">Which case for:</div>
                <div className="text-yellow-400 font-bold text-sm sm:text-base">{currentPrep.german}</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-right">
                <div className="text-[10px] sm:text-xs text-gray-400">Meaning:</div>
                <div className="text-white font-bold text-xs sm:text-sm">{currentPrep.english}</div>
              </div>
            </div>
          )}

          {/* Pause hint (desktop only) */}
          <div className="absolute bottom-2 right-2 text-gray-600 text-xs hidden sm:block">
            ESC to pause
          </div>

          {/* Word Reveal Overlay */}
          {showWordReveal && revealedPrep && (
            <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-30">
              {(collisionPhase === 'start' || collisionPhase === 'moving') ? (
                <div className="relative w-full h-20 flex items-center justify-center">
                  <div
                    className={`absolute text-2xl sm:text-3xl md:text-5xl font-black transition-all duration-700 ease-out ${getCaseTextColor(revealedPrep.case)}`}
                    style={{ transform: collisionPhase === 'start' ? 'translateX(-100px)' : 'translateX(-10px)' }}
                  >
                    {revealedPrep.case}
                  </div>
                  <div
                    className="absolute text-2xl sm:text-3xl md:text-5xl font-black text-yellow-400 transition-all duration-700 ease-out"
                    style={{ transform: collisionPhase === 'start' ? 'translateX(100px)' : 'translateX(60px)' }}
                  >
                    {revealedPrep.german}
                  </div>
                </div>
              ) : (
                <div className="text-center px-4">
                  <div className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 animate-pulse">
                    <span className={getCaseTextColor(revealedPrep.case)}>{revealedPrep.case} </span>
                    <span className="text-yellow-400">{revealedPrep.german}</span>
                  </div>
                  <div className="text-sm sm:text-base text-gray-400 mb-2">{revealedPrep.english}</div>
                  <div className="text-base sm:text-lg md:text-xl text-gray-300 animate-fade-in-up italic">
                    {revealedPrep.example}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ControlsHint />

        <AnsweredPrepositionsList answeredPrepositions={answeredPreps} progressMap={progressMap} />
      </div>
    );
  }
);
