import { useRef, useEffect, useState } from 'react';

interface UseAnimatedCounterProps {
  /** Target value to count to */
  target: number;
  /** Starting value (default: 0) */
  initialValue?: number;
  /** Amount to increment by each interval (default: calculated automatically) */
  increment?: number;
  /** Time between increments in ms (default: 20) */
  interval?: number;
  /** Type of counter (default: 'increment') */
  type?: 'increment' | 'decrement';
}

/**
 * Hook that animates a counter from initial value to target value
 * @example const count = useAnimatedCounter({ target: 1000, interval: 10 });
 */
export function useAnimatedCounter({
  target,
  initialValue = 0,
  increment,
  interval = 20,
  type = 'increment',
}: UseAnimatedCounterProps): number {
  const [counter, setCounter] = useState(initialValue);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate optimal increment if not provided
  const calculatedIncrement = increment || Math.ceil(Math.abs(target - initialValue) / 50);
  const step = type === 'decrement' ? -calculatedIncrement : calculatedIncrement;

  const updateCounter = () => {
    setCounter((prev) => {
      // Check if we've reached the target
      const reachedTarget =
        type === 'increment' ? prev >= target : prev <= target;

      if (reachedTarget) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return target;
      }

      // Calculate next value
      const next = prev + step;

      // Don't overshoot the target
      if (type === 'increment' && next > target) return target;
      if (type === 'decrement' && next < target) return target;

      return next;
    });
  };

  useEffect(() => {
    intervalRef.current = setInterval(updateCounter, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, interval]);

  return counter;
}
