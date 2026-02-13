"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import confetti from "canvas-confetti";
import {
  EndingEntry, FloatingArticle, ARTICLES, ENDING_DATA,
  LANE_COUNT, PACMAN_X, ARTICLE_SPAWN_X, BASE_SPEED, SPEED_INCREMENT, MAX_ARTICLES,
  getArticleColor, getArticleTextColor,
} from "./derdiedas/data";
import { GameStats } from "./pacman/data";
import { MenuScreen } from "./derdiedas/MenuScreen";
import { ReviewScreen } from "./derdiedas/ReviewScreen";
import { AnsweredEndingsList } from "./derdiedas/AnsweredEndingsList";
import { StatsBar } from "./pacman/StatsBar";
import { PausedScreen } from "./pacman/PausedScreen";
import { SummaryScreen } from "./pacman/SummaryScreen";
import { useDerDieDasProgress } from "@/lib/hooks/useDerDieDasProgress";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { saveDailyProgress } from "@/lib/services/turso";

export interface DerDieDasGameRef {
  endGame: () => void;
  reviewEndings: () => void;
}

interface DerDieDasGameProps {
  onBack: () => void;
  onGameStateChange?: (state: string) => void;
}

export const DerDieDasGame = forwardRef<DerDieDasGameRef, DerDieDasGameProps>(function DerDieDasGame(
  { onBack, onGameStateChange },
  ref
) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'summary' | 'review'>('menu');
  const [pacmanLane, setPacmanLane] = useState(1); // Middle of 3 lanes
  const [floatingArticles, setFloatingArticles] = useState<FloatingArticle[]>([]);
  const [currentEnding, setCurrentEnding] = useState<EndingEntry | null>(null);
  const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
  const [level, setLevel] = useState(1);
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(true);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [revealedEnding, setRevealedEnding] = useState<EndingEntry | null>(null);
  const [collisionPhase, setCollisionPhase] = useState<'start' | 'moving' | 'combined' | null>(null);
  const [answeredEndings, setAnsweredEndings] = useState<EndingEntry[]>([]);
  const answeredEndingsRef = useRef<Set<string>>(new Set());
  const { progressMap, recordCorrect } = useDerDieDasProgress();
  const { session } = useFirebaseAuth();
  const userId = session?.user?.email || null;

  // Refs
  const endGame = useCallback(() => {
    setGameState('summary');
    if (userId && (stats.correct > 0 || stats.incorrect > 0)) {
      saveDailyProgress(userId, {
        cardsReviewed: stats.correct + stats.incorrect,
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        timeSpent: 0,
      }).catch((err) => console.error("[DerDieDasGame] Failed to save daily progress:", err));
    }
  }, [userId, stats]);
  const reviewEndings = useCallback(() => setGameState('review'), []);
  useImperativeHandle(ref, () => ({ endGame, reviewEndings }), [endGame, reviewEndings]);

  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  const gameLoopRef = useRef<number>();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const articleCountRef = useRef(0);
  const showWordRevealRef = useRef(false);
  const catchProcessingRef = useRef(false);

  // Touch drag state
  const touchStartY = useRef<number | null>(null);
  const touchStartLane = useRef<number>(0);

  // Pacman mouth animation
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => setPacmanMouthOpen(prev => !prev), 200);
    return () => clearInterval(interval);
  }, [gameState]);

  const getRandomEnding = useCallback(() => {
    const fresh = ENDING_DATA.filter(e => !answeredEndingsRef.current.has(e.ending));
    if (fresh.length === 0) {
      answeredEndingsRef.current.clear();
      setAnsweredEndings([]);
      return ENDING_DATA[Math.floor(Math.random() * ENDING_DATA.length)];
    }
    return fresh[Math.floor(Math.random() * fresh.length)];
  }, []);

  const spawnArticle = useCallback(() => {
    if (!currentEnding) return;
    if (articleCountRef.current >= MAX_ARTICLES) return;

    setFloatingArticles(prev => {
      const occupiedLanes = new Set(prev.filter(a => a.x > 70).map(a => a.lane));
      const availableLanes = Array.from({ length: LANE_COUNT }, (_, i) => i)
        .filter(lane => !occupiedLanes.has(lane));
      if (availableLanes.length === 0) return prev;

      const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
      const speed = BASE_SPEED + (level - 1) * SPEED_INCREMENT;
      // ~40% chance of correct since only 3 options
      const isCorrect = Math.random() < 0.4;
      const wrongArticles = ARTICLES.filter(a => a !== currentEnding.article);
      const article = isCorrect
        ? currentEnding.article
        : wrongArticles[Math.floor(Math.random() * wrongArticles.length)];

      articleCountRef.current = prev.length + 1;
      return [...prev, {
        id: `${article}-${Date.now()}-${Math.random()}`,
        article, lane, x: ARTICLE_SPAWN_X, speed,
        isCorrect: article === currentEnding.article,
      }];
    });
  }, [currentEnding, level]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80, spread: 60,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#3B82F6', '#EC4899', '#22C55E', '#FACC15'],
    });
  }, []);

  const checkCollision = useCallback((article: FloatingArticle) => {
    const pacmanXEnd = PACMAN_X + 8;
    return article.x <= pacmanXEnd && article.x > PACMAN_X - 2 && article.lane === pacmanLane;
  }, [pacmanLane]);

  const handleCatch = useCallback((article: FloatingArticle) => {
    // Guard against double-calls from React strict mode re-running state updaters
    if (catchProcessingRef.current) return;
    catchProcessingRef.current = true;
    setTimeout(() => { catchProcessingRef.current = false; }, 50);

    if (article.isCorrect && currentEnding) {
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

      if (!answeredEndingsRef.current.has(currentEnding.ending)) {
        answeredEndingsRef.current.add(currentEnding.ending);
        setAnsweredEndings(prev => [...prev, currentEnding]);
      }
      recordCorrect({ ending: currentEnding.ending, article: currentEnding.article });

      setFloatingArticles([]);
      articleCountRef.current = 0;
      setRevealedEnding(currentEnding);
      setShowWordReveal(true);
      showWordRevealRef.current = true;
      setCollisionPhase('start');

      setTimeout(() => setCollisionPhase('moving'), 50);
      setTimeout(() => { setCollisionPhase('combined'); fireConfetti(); }, 900);
      setTimeout(() => {
        setShowWordReveal(false);
        showWordRevealRef.current = false;
        setCollisionPhase(null);
        setRevealedEnding(null);
        setCurrentEnding(getRandomEnding());
      }, 2800);
    } else {
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 300);
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
    }
  }, [stats, fireConfetti, getRandomEnding, currentEnding, recordCorrect]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const gameLoop = () => {
      setFloatingArticles(prev => {
        const updated: FloatingArticle[] = [];
        let caughtArticle: FloatingArticle | null = null;
        for (const article of prev) {
          const newX = article.x - article.speed;
          if (checkCollision({ ...article, x: newX })) { caughtArticle = article; continue; }
          if (newX < -15) continue;
          updated.push({ ...article, x: newX });
        }
        articleCountRef.current = updated.length;
        if (caughtArticle) setTimeout(() => handleCatch(caughtArticle!), 0);
        return updated;
      });
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, checkCollision, handleCatch]);

  // Spawn articles
  useEffect(() => {
    if (gameState !== 'playing' || !currentEnding) return;
    if (showWordRevealRef.current) return;
    spawnArticle();
    const spawnInterval = Math.max(800 - (level * 50), 400);
    const intervalId = setInterval(() => {
      if (!showWordRevealRef.current) spawnArticle();
    }, spawnInterval);
    return () => clearInterval(intervalId);
  }, [gameState, currentEnding, spawnArticle, level]);

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
    setPacmanLane(1);
    setFloatingArticles([]);
    articleCountRef.current = 0;
    answeredEndingsRef.current.clear();
    setAnsweredEndings([]);
    setCurrentEnding(getRandomEnding());
  };

  // --- Non-playing screens ---
  if (gameState === 'menu') {
    return <MenuScreen onStart={startGame} onReview={() => setGameState('review')} />;
  }
  if (gameState === 'summary') {
    return <SummaryScreen stats={stats} onPlayAgain={startGame} onBack={onBack} />;
  }
  if (gameState === 'paused') {
    return <PausedScreen onResume={() => setGameState('playing')} onRestart={startGame} onQuit={onBack} />;
  }
  if (gameState === 'review') {
    return <ReviewScreen onBack={() => setGameState('menu')} onStart={startGame} />;
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
        {/* Background ending */}
        {currentEnding && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-20 px-4">
              <div className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-2">
                {currentEnding.ending}
              </div>
              <div className="text-sm sm:text-base md:text-lg text-gray-300">
                {currentEnding.examples.slice(0, 2).map(ex => ex.replace(/^(der|die|das)\s+/i, '')).join(", ")}
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

        {/* Floating articles */}
        {floatingArticles.map(article => (
          <div
            key={article.id}
            className="absolute transition-none z-10"
            style={{
              left: `${article.x}%`,
              top: `${article.lane * laneHeight + laneHeight / 2}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-black text-sm sm:text-base md:text-lg shadow-lg whitespace-nowrap bg-gradient-to-r ${getArticleColor(article.article)} text-white`}>
              {article.article}
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
        {currentEnding && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2">
              <div className="text-[10px] sm:text-xs text-gray-400">Which article for:</div>
              <div className="text-yellow-400 font-bold text-sm sm:text-base">{currentEnding.ending}</div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-right">
              <div className="text-[10px] sm:text-xs text-gray-400">Example:</div>
              <div className="text-white font-bold text-xs sm:text-sm">{currentEnding.examples[0].replace(/^(der|die|das)\s+/i, '')}</div>
            </div>
          </div>
        )}

        {/* Pause hint (desktop only) */}
        <div className="absolute bottom-2 right-2 text-gray-600 text-xs hidden sm:block">
          ESC to pause
        </div>

        {/* Word Reveal Overlay */}
        {showWordReveal && revealedEnding && (
          <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-30">
            {(collisionPhase === 'start' || collisionPhase === 'moving') ? (
              <div className="relative w-full h-20 flex items-center justify-center">
                <div
                  className={`absolute text-2xl sm:text-3xl md:text-5xl font-black transition-all duration-700 ease-out ${getArticleTextColor(revealedEnding.article)}`}
                  style={{ transform: collisionPhase === 'start' ? 'translateX(-100px)' : 'translateX(-10px)' }}
                >
                  {revealedEnding.article}
                </div>
                <div
                  className="absolute text-2xl sm:text-3xl md:text-5xl font-black text-yellow-400 transition-all duration-700 ease-out"
                  style={{ transform: collisionPhase === 'start' ? 'translateX(100px)' : 'translateX(60px)' }}
                >
                  {revealedEnding.ending}
                </div>
              </div>
            ) : (
              <div className="text-center px-4">
                <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 animate-pulse">
                  <span className={getArticleTextColor(revealedEnding.article)}>{revealedEnding.article} </span>
                  <span className="text-yellow-400">{revealedEnding.ending}</span>
                </div>
                {revealedEnding.rule && (
                  <div className="text-sm sm:text-base text-gray-400 mb-2">{revealedEnding.rule}</div>
                )}
                <div className="text-base sm:text-lg md:text-xl text-gray-300 animate-fade-in-up">
                  {revealedEnding.examples.join(", ")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile controls hint */}
      <div className="text-center text-gray-500 text-xs mt-3 sm:mt-4">
        <span className="sm:hidden">Drag up/down to move Pacman</span>
        <span className="hidden sm:inline">Arrow Keys or W/S to move Pacman</span>
      </div>

      <AnsweredEndingsList answeredEndings={answeredEndings} progressMap={progressMap} />
    </div>
  );
});
