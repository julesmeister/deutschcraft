"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import confetti from "canvas-confetti";
import {
  VerbEntry, FloatingPrefix, PREFIXES, VERB_DATA,
  LANE_COUNT, PACMAN_X, PREFIX_SPAWN_X, BASE_SPEED, SPEED_INCREMENT, MAX_PREFIXES,
  getPrefixColor,
} from "./pacman/data";
import { GameStats } from "./shared/types";
import { MenuScreen } from "./pacman/MenuScreen";
import { SummaryScreen } from "./pacman/SummaryScreen";
import { PausedScreen } from "./pacman/PausedScreen";
import { ReviewScreen } from "./pacman/ReviewScreen";
import { RootSelector } from "./pacman/RootSelector";
import { AnsweredWordsList } from "./pacman/AnsweredWordsList";
import { StatsBar } from "./pacman/StatsBar";
import { usePacmanProgress } from "@/lib/hooks/usePacmanProgress";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { saveDailyProgress } from "@/lib/services/turso";
import { weightedRandomPick } from "@/lib/utils/weightedRandom";
import { usePacmanControls } from "./shared/usePacmanControls";
import { useGameLoop } from "./shared/useGameLoop";
import { PacmanCharacter } from "./shared/PacmanCharacter";
import { LaneGuides } from "./shared/LaneGuides";
import { ControlsHint } from "./shared/ControlsHint";

export interface PacmanGameRef {
  endGame: () => void;
  reviewWords: () => void;
}

interface PacmanGameProps {
  flashcards: any[];
  onBack: () => void;
  onGameStateChange?: (state: string) => void;
}

export const PacmanGame = forwardRef<PacmanGameRef, PacmanGameProps>(function PacmanGame(
  { onBack, onGameStateChange },
  ref
) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'summary' | 'review'>('menu');
  const [pacmanLane, setPacmanLane] = useState(Math.floor(LANE_COUNT / 2));
  const [floatingPrefixes, setFloatingPrefixes] = useState<FloatingPrefix[]>([]);
  const [currentVerb, setCurrentVerb] = useState<VerbEntry | null>(null);
  const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
  const [level, setLevel] = useState(1);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [revealedVerb, setRevealedVerb] = useState<VerbEntry | null>(null);
  const [collisionPhase, setCollisionPhase] = useState<'start' | 'moving' | 'combined' | null>(null);
  const [answeredVerbs, setAnsweredVerbs] = useState<VerbEntry[]>([]);
  const answeredVerbsRef = useRef<Set<string>>(new Set());
  const mistakeCountsRef = useRef<Record<string, number>>({});
  const [selectedRoots, setSelectedRoots] = useState<Set<string>>(new Set());
  const { progressMap, recordCorrect } = usePacmanProgress();
  const { session } = useFirebaseAuth();
  const userId = session?.user?.email || null;

  const { pacmanMouthOpen, gameAreaRef, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePacmanControls(gameState, LANE_COUNT, pacmanLane, setPacmanLane, setGameState);

  const allRoots = [...new Set(VERB_DATA.map(v => v.root))];
  const activeVerbData = selectedRoots.size === 0
    ? VERB_DATA
    : VERB_DATA.filter(v => selectedRoots.has(v.root));

  const toggleRoot = (root: string) => {
    setSelectedRoots(prev => {
      const next = new Set(prev);
      if (next.has(root)) next.delete(root);
      else next.add(root);
      return next;
    });
  };
  const clearRoots = () => setSelectedRoots(new Set());

  // Refs
  const endGame = useCallback(() => {
    setGameState('summary');
    if (userId && (stats.correct > 0 || stats.incorrect > 0)) {
      saveDailyProgress(userId, {
        cardsReviewed: stats.correct + stats.incorrect,
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        timeSpent: 0,
      }).catch((err) => console.error("[PacmanGame] Failed to save daily progress:", err));
    }
  }, [userId, stats]);
  const reviewWords = useCallback(() => setGameState('review'), []);
  useImperativeHandle(ref, () => ({ endGame, reviewWords }), [endGame, reviewWords]);

  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  const usedVerbIds = useRef<Set<string>>(new Set());
  const prefixCountRef = useRef(0);
  const showWordRevealRef = useRef(false);

  const getRandomVerb = useCallback(() => {
    let pool = activeVerbData.filter(v => !answeredVerbsRef.current.has(v.full));
    if (pool.length === 0) {
      answeredVerbsRef.current.clear();
      setAnsweredVerbs([]);
      pool = activeVerbData;
    }
    return weightedRandomPick(pool, v => v.full, progressMap, mistakeCountsRef.current);
  }, [activeVerbData, progressMap]);

  const getWrongPrefixes = useCallback((correctPrefix: string): string[] => {
    return PREFIXES.filter(p => p !== correctPrefix);
  }, []);

  const spawnPrefix = useCallback(() => {
    if (!currentVerb) return;
    if (prefixCountRef.current >= MAX_PREFIXES) return;

    setFloatingPrefixes(prev => {
      const occupiedLanes = new Set(prev.filter(p => p.x > 70).map(p => p.lane));
      const availableLanes = Array.from({ length: LANE_COUNT }, (_, i) => i)
        .filter(lane => !occupiedLanes.has(lane));
      if (availableLanes.length === 0) return prev;

      const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
      const speed = BASE_SPEED + (level - 1) * SPEED_INCREMENT;
      const isCorrect = Math.random() < 0.35;
      const wrongPrefixes = getWrongPrefixes(currentVerb.prefix);
      const prefix = isCorrect
        ? currentVerb.prefix
        : wrongPrefixes[Math.floor(Math.random() * wrongPrefixes.length)];

      prefixCountRef.current = prev.length + 1;
      return [...prev, {
        id: `${prefix}-${Date.now()}-${Math.random()}`,
        prefix, lane, x: PREFIX_SPAWN_X, speed,
        isCorrect: prefix === currentVerb.prefix,
      }];
    });
  }, [currentVerb, level, getWrongPrefixes]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80, spread: 60,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FACC15', '#22C55E', '#3B82F6', '#A855F7'],
    });
  }, []);

  const handleCatch = useCallback((prefix: FloatingPrefix) => {
    if (prefix.isCorrect && currentVerb) {
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

      if (!answeredVerbsRef.current.has(currentVerb.full)) {
        answeredVerbsRef.current.add(currentVerb.full);
        setAnsweredVerbs(prev => [...prev, currentVerb]);
      }
      recordCorrect(currentVerb);

      setFloatingPrefixes([]);
      prefixCountRef.current = 0;
      setRevealedVerb(currentVerb);
      setShowWordReveal(true);
      showWordRevealRef.current = true;
      setCollisionPhase('start');

      setTimeout(() => setCollisionPhase('moving'), 50);
      setTimeout(() => { setCollisionPhase('combined'); fireConfetti(); }, 900);
      setTimeout(() => {
        setShowWordReveal(false);
        showWordRevealRef.current = false;
        setCollisionPhase(null);
        setRevealedVerb(null);
        setCurrentVerb(getRandomVerb());
      }, 2800);
    } else {
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 300);
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
      if (currentVerb) {
        mistakeCountsRef.current[currentVerb.full] = (mistakeCountsRef.current[currentVerb.full] || 0) + 1;
      }
    }
  }, [stats, fireConfetti, getRandomVerb, currentVerb]);

  // Game loop (shared hook)
  useGameLoop(gameState, pacmanLane, PACMAN_X, setFloatingPrefixes, prefixCountRef, handleCatch);

  // Spawn prefixes
  useEffect(() => {
    if (gameState !== 'playing' || !currentVerb) return;
    if (showWordRevealRef.current) return;
    spawnPrefix();
    const spawnInterval = Math.max(800 - (level * 50), 400);
    const intervalId = setInterval(() => {
      if (!showWordRevealRef.current) spawnPrefix();
    }, spawnInterval);
    return () => clearInterval(intervalId);
  }, [gameState, currentVerb, spawnPrefix, level]);

  const startGame = () => {
    setGameState('playing');
    setStats({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setLevel(1);
    setPacmanLane(Math.floor(LANE_COUNT / 2));
    setFloatingPrefixes([]);
    prefixCountRef.current = 0;
    usedVerbIds.current.clear();
    answeredVerbsRef.current.clear();
    mistakeCountsRef.current = {};
    setAnsweredVerbs([]);
    setCurrentVerb(getRandomVerb());
  };

  // Shared root selector props
  const rootSelectorProps = {
    allRoots, selectedRoots, activeVerbData,
    onToggleRoot: toggleRoot, onClear: clearRoots, onClearRoots: clearRoots,
  };

  // --- Non-playing screens ---
  if (gameState === 'menu') {
    return <MenuScreen {...rootSelectorProps} onStart={startGame} onReview={() => setGameState('review')} />;
  }
  if (gameState === 'summary') {
    return (
      <div>
        <SummaryScreen stats={stats} onPlayAgain={startGame} onBack={onBack} />
        <AnsweredWordsList answeredVerbs={answeredVerbs} progressMap={progressMap} />
      </div>
    );
  }
  if (gameState === 'paused') {
    return (
      <div>
        <PausedScreen onResume={() => setGameState('playing')} onRestart={startGame} onQuit={onBack} />
        <AnsweredWordsList answeredVerbs={answeredVerbs} progressMap={progressMap} />
      </div>
    );
  }
  if (gameState === 'review') {
    return <ReviewScreen {...rootSelectorProps} onBack={() => setGameState('menu')} onStart={startGame} />;
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
        {/* Background meaning */}
        {currentVerb && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-20 px-4">
              <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-2">
                ____{currentVerb.root}
              </div>
              <div className="text-base sm:text-xl md:text-2xl text-gray-300">
                {currentVerb.meaning}
              </div>
            </div>
          </div>
        )}

        <LaneGuides laneCount={LANE_COUNT} />

        {/* Floating prefixes */}
        {floatingPrefixes.map(prefix => (
          <div
            key={prefix.id}
            className="absolute transition-none z-10"
            style={{
              left: `${prefix.x}%`,
              top: `${prefix.lane * laneHeight + laneHeight / 2}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base shadow-lg whitespace-nowrap bg-gradient-to-r ${getPrefixColor(prefix.prefix)} text-white`}>
              {prefix.prefix}
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
        {currentVerb && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2">
              <div className="text-[10px] sm:text-xs text-gray-400">Find prefix for:</div>
              <div className="text-white font-bold text-xs sm:text-sm">{currentVerb.meaning}</div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-right">
              <div className="text-[10px] sm:text-xs text-gray-400">Root verb:</div>
              <div className="text-yellow-400 font-bold text-xs sm:text-sm">{currentVerb.root}</div>
            </div>
          </div>
        )}

        {/* Pause hint (desktop only) */}
        <div className="absolute bottom-2 right-2 text-gray-600 text-xs hidden sm:block">
          ESC to pause
        </div>

        {/* Word Reveal Overlay */}
        {showWordReveal && revealedVerb && (
          <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-30">
            {(collisionPhase === 'start' || collisionPhase === 'moving') ? (
              <div className="relative w-full h-20 flex items-center justify-center">
                <div
                  className="absolute text-2xl sm:text-3xl md:text-5xl font-black text-green-400 transition-all duration-700 ease-out"
                  style={{ transform: collisionPhase === 'start' ? 'translateX(-100px)' : 'translateX(-10px)' }}
                >
                  {revealedVerb.prefix.replace('-', '')}
                </div>
                <div
                  className="absolute text-2xl sm:text-3xl md:text-5xl font-black text-yellow-400 transition-all duration-700 ease-out"
                  style={{ transform: collisionPhase === 'start' ? 'translateX(100px)' : 'translateX(60px)' }}
                >
                  {revealedVerb.root}
                </div>
              </div>
            ) : (
              <div className="text-center px-4">
                <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 animate-pulse">
                  <span className="text-green-400">{revealedVerb.prefix.replace('-', '')}</span>
                  <span className="text-yellow-400">{revealedVerb.root}</span>
                </div>
                <div className="text-lg sm:text-xl md:text-2xl text-gray-300 animate-fade-in-up">
                  {revealedVerb.meaning}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ControlsHint />

      <AnsweredWordsList answeredVerbs={answeredVerbs} progressMap={progressMap} />

      <div className="mt-3 sm:mt-4">
        <RootSelector {...rootSelectorProps} onClear={clearRoots} />
      </div>
    </div>
  );
});
