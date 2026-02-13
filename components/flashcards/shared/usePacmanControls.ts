import { useState, useEffect, useCallback, useRef } from "react";

type GameState = "menu" | "playing" | "paused" | "summary" | "review";

/**
 * Shared hook for Pacman-style game controls:
 * - Keyboard: ArrowUp/Down, W/S to move lanes, Escape to pause
 * - Touch: drag up/down to move lanes
 * - Mouth animation: toggles every 200ms while playing
 */
export function usePacmanControls(
  gameState: GameState,
  laneCount: number,
  pacmanLane: number,
  setPacmanLane: React.Dispatch<React.SetStateAction<number>>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
) {
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(true);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartLane = useRef<number>(0);

  // Mouth animation
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => setPacmanMouthOpen((prev) => !prev), 200);
    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "playing") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          setPacmanLane((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          setPacmanLane((prev) => Math.min(laneCount - 1, prev + 1));
        } else if (e.key === "Escape") {
          setGameState("paused");
        }
      } else if (gameState === "paused") {
        if (e.key === "Escape" || e.key === " ") setGameState("playing");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, laneCount, setPacmanLane, setGameState]);

  // Touch drag handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (gameState !== "playing") return;
      touchStartY.current = e.touches[0].clientY;
      touchStartLane.current = pacmanLane;
    },
    [gameState, pacmanLane],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (gameState !== "playing" || touchStartY.current === null || !gameAreaRef.current) return;
      e.preventDefault();
      const deltaY = e.touches[0].clientY - touchStartY.current;
      const areaHeight = gameAreaRef.current.getBoundingClientRect().height;
      const laneHeight = areaHeight / laneCount;
      const laneDelta = Math.round(deltaY / laneHeight);
      const newLane = Math.max(0, Math.min(laneCount - 1, touchStartLane.current + laneDelta));
      setPacmanLane(newLane);
    },
    [gameState, laneCount, setPacmanLane],
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  return {
    pacmanMouthOpen,
    gameAreaRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
