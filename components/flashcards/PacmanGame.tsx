"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import confetti from "canvas-confetti";
import {
  VerbEntry, FloatingPrefix, GameStats, PREFIXES, VERB_DATA,
  LANE_COUNT, PACMAN_X, PREFIX_SPAWN_X, BASE_SPEED, SPEED_INCREMENT, MAX_PREFIXES,
  getPrefixColor,
} from "./pacman/data";
import { MenuScreen } from "./pacman/MenuScreen";
import { SummaryScreen } from "./pacman/SummaryScreen";
import { PausedScreen } from "./pacman/PausedScreen";
import { ReviewScreen } from "./pacman/ReviewScreen";
import { RootSelector } from "./pacman/RootSelector";
import { AnsweredWordsList } from "./pacman/AnsweredWordsList";
import { StatsBar } from "./pacman/StatsBar";
import { usePacmanProgress } from "@/lib/hooks/usePacmanProgress";

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
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(true);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [revealedVerb, setRevealedVerb] = useState<VerbEntry | null>(null);
  const [collisionPhase, setCollisionPhase] = useState<'start' | 'moving' | 'combined' | null>(null);
  const [answeredVerbs, setAnsweredVerbs] = useState<VerbEntry[]>([]);
  const answeredVerbsRef = useRef<Set<string>>(new Set());
  const [selectedRoots, setSelectedRoots] = useState<Set<string>>(new Set());
  const { progressMap, recordCorrect } = usePacmanProgress();

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
  const endGame = useCallback(() => setGameState('summary'), []);
  const reviewWords = useCallback(() => setGameState('review'), []);
  useImperativeHandle(ref, () => ({ endGame, reviewWords }), [endGame, reviewWords]);

  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  const gameLoopRef = useRef<number>();
  const usedVerbIds = useRef<Set<string>>(new Set());
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const prefixCountRef = useRef(0);
  const showWordRevealRef = useRef(false);

  // Touch drag state
  const touchStartY = useRef<number | null>(null);
  const touchStartLane = useRef<number>(0);

  // Pacman mouth animation
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => setPacmanMouthOpen(prev => !prev), 200);
    return () => clearInterval(interval);
  }, [gameState]);

  const getRandomVerb = useCallback(() => {
    const pool = activeVerbData;
    const fresh = pool.filter(v => !answeredVerbsRef.current.has(v.full));
    if (fresh.length === 0) {
      answeredVerbsRef.current.clear();
      setAnsweredVerbs([]);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return fresh[Math.floor(Math.random() * fresh.length)];
  }, [activeVerbData]);

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

  const checkCollision = useCallback((prefix: FloatingPrefix) => {
    const pacmanXEnd = PACMAN_X + 8;
    return prefix.x <= pacmanXEnd && prefix.x > PACMAN_X - 2 && prefix.lane === pacmanLane;
  }, [pacmanLane]);

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
    }
  }, [stats, fireConfetti, getRandomVerb, currentVerb]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const gameLoop = () => {
      setFloatingPrefixes(prev => {
        const updated: FloatingPrefix[] = [];
        let caughtPrefix: FloatingPrefix | null = null;
        for (const prefix of prev) {
          const newX = prefix.x - prefix.speed;
          if (checkCollision({ ...prefix, x: newX })) { caughtPrefix = prefix; continue; }
          if (newX < -15) continue;
          updated.push({ ...prefix, x: newX });
        }
        prefixCountRef.current = updated.length;
        if (caughtPrefix) setTimeout(() => handleCatch(caughtPrefix!), 0);
        return updated;
      });
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, checkCollision, handleCatch]);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setPacmanLane(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setPacmanLane(prev => Math.min(LANE_COUNT - 1, prev + 1));
        } else if (e.key === 'Escape') {
          setGameState('paused');
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === ' ') setGameState('playing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    touchStartY.current = e.touches[0].clientY;
    touchStartLane.current = pacmanLane;
  }, [gameState, pacmanLane]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing' || touchStartY.current === null || !gameAreaRef.current) return;
    e.preventDefault();
    const deltaY = e.touches[0].clientY - touchStartY.current;
    const areaHeight = gameAreaRef.current.getBoundingClientRect().height;
    const laneHeight = areaHeight / LANE_COUNT;
    const laneDelta = Math.round(deltaY / laneHeight);
    const newLane = Math.max(0, Math.min(LANE_COUNT - 1, touchStartLane.current + laneDelta));
    setPacmanLane(newLane);
  }, [gameState]);

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setStats({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setLevel(1);
    setPacmanLane(Math.floor(LANE_COUNT / 2));
    setFloatingPrefixes([]);
    prefixCountRef.current = 0;
    usedVerbIds.current.clear();
    answeredVerbsRef.current.clear();
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
    return <SummaryScreen stats={stats} onPlayAgain={startGame} onBack={onBack} />;
  }
  if (gameState === 'paused') {
    return <PausedScreen onResume={() => setGameState('playing')} onRestart={startGame} onQuit={onBack} />;
  }
  if (gameState === 'review') {
    return <ReviewScreen {...rootSelectorProps} onBack={() => setGameState('menu')} onStart={startGame} />;
  }

  // --- Playing screen ---
  const laneHeight = 100 / LANE_COUNT;
  const pacmanTop = pacmanLane * laneHeight + laneHeight / 2;
  const mouthAngle = pacmanMouthOpen ? 25 : 5;

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

        {/* Lane guides */}
        {Array.from({ length: LANE_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b border-gray-700/30"
            style={{ top: `${((i + 1) / LANE_COUNT) * 100}%` }}
          />
        ))}

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
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d={`M50,50 L${50 + 45 * Math.cos(mouthAngle * Math.PI / 180)},${50 - 45 * Math.sin(mouthAngle * Math.PI / 180)} A45,45 0 1,0 ${50 + 45 * Math.cos(mouthAngle * Math.PI / 180)},${50 + 45 * Math.sin(mouthAngle * Math.PI / 180)} Z`}
                fill="#FACC15"
              />
              <circle cx="55" cy="25" r="6" fill="#000" />
            </svg>
          </div>
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

      {/* Mobile controls (buttons removed - drag to move) */}
      <div className="text-center text-gray-500 text-xs mt-3 sm:mt-4">
        <span className="sm:hidden">Drag up/down to move Pacman</span>
        <span className="hidden sm:inline">Arrow Keys or W/S to move Pacman</span>
      </div>

      <AnsweredWordsList answeredVerbs={answeredVerbs} progressMap={progressMap} />

      <div className="mt-3 sm:mt-4">
        <RootSelector {...rootSelectorProps} onClear={clearRoots} />
      </div>
    </div>
  );
});
