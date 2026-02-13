import { useEffect, useCallback, useRef } from "react";

/** Minimum shape for a floating item in the game loop */
export interface FloatingItem {
  x: number;
  speed: number;
  lane: number;
}

/**
 * Generic game loop for Pacman-style games.
 * Moves floating items left, detects collision with Pacman, and calls handleCatch.
 */
export function useGameLoop<T extends FloatingItem>(
  gameState: string,
  pacmanLane: number,
  pacmanX: number,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  countRef: React.MutableRefObject<number>,
  handleCatch: (item: T) => void,
) {
  const gameLoopRef = useRef<number>(0);

  const checkCollision = useCallback(
    (item: FloatingItem) => {
      const pacmanXEnd = pacmanX + 8;
      return item.x <= pacmanXEnd && item.x > pacmanX - 2 && item.lane === pacmanLane;
    },
    [pacmanLane, pacmanX],
  );

  useEffect(() => {
    if (gameState !== "playing") return;
    const gameLoop = () => {
      setItems((prev) => {
        const updated: T[] = [];
        let caught: T | null = null;
        for (const item of prev) {
          const newX = item.x - item.speed;
          if (checkCollision({ ...item, x: newX })) {
            caught = item;
            continue;
          }
          if (newX < -15) continue;
          updated.push({ ...item, x: newX });
        }
        countRef.current = updated.length;
        if (caught) setTimeout(() => handleCatch(caught!), 0);
        return updated;
      });
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, checkCollision, handleCatch, setItems, countRef]);
}
