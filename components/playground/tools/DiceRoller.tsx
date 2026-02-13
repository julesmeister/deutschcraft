"use client";

import { useState, useCallback } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";

const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

function DiceFace({ value, isRolling }: { value: number; isRolling: boolean }) {
  const dots = DICE_DOTS[value] || [];
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-14 h-14 ${isRolling ? "animate-spin" : ""}`}
      style={isRolling ? { animationDuration: "0.3s" } : undefined}
    >
      <rect
        x="2" y="2" width="96" height="96" rx="12"
        fill="white" stroke="#d1d5db" strokeWidth="2"
      />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#1f2937" />
      ))}
    </svg>
  );
}

interface DiceRollerProps {
  toolState: ClassroomToolContext;
}

export function DiceRoller({ toolState }: DiceRollerProps) {
  const { useToolValue, isTeacher } = toolState;
  const [diceCount, setDiceCount] = useToolValue("dice-count", 1);
  const [values, setValues] = useToolValue<number[]>("dice-values", [1]);
  const [isRolling, setIsRolling] = useState(false);

  const roll = useCallback(() => {
    if (!isTeacher) return;
    setIsRolling(true);
    const flashInterval = setInterval(() => {
      setValues(Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6)));
    }, 80);

    setTimeout(() => {
      clearInterval(flashInterval);
      setValues(Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6)));
      setIsRolling(false);
    }, 500);
  }, [diceCount, setValues, isTeacher]);

  const adjustCount = (delta: number) => {
    if (!isTeacher) return;
    const next = Math.max(1, Math.min(3, diceCount + delta));
    setDiceCount(next);
    setValues(Array.from({ length: next }, () => 1));
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Dice count control */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Dice count</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustCount(-1)}
            disabled={diceCount <= 1 || !isTeacher}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold"
          >
            −
          </button>
          <span className="text-sm font-semibold w-4 text-center">{diceCount}</span>
          <button
            onClick={() => adjustCount(1)}
            disabled={diceCount >= 3 || !isTeacher}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Dice faces */}
      <div className="flex items-center justify-center gap-3 py-2">
        {values.map((v, i) => (
          <DiceFace key={i} value={v} isRolling={isRolling} />
        ))}
      </div>

      {/* Total */}
      {diceCount > 1 && (
        <p className="text-center text-sm text-gray-500">
          Total: <span className="font-bold text-gray-900">{total}</span>
        </p>
      )}

      {/* Roll button */}
      {isTeacher && (
        <button
          onClick={roll}
          disabled={isRolling}
          className="w-full py-2 rounded-lg bg-pastel-ocean text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isRolling ? "Rolling..." : "Roll"}
        </button>
      )}
    </div>
  );
}
