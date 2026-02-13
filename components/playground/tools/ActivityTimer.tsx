"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";

const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
];

type Mode = "countdown" | "stopwatch";

interface TimerState {
  mode: Mode;
  totalSeconds: number;
  // Anchor timestamps for sync across clients
  startedAt: number | null;       // Date.now() when started
  pausedRemaining: number | null; // Seconds left when paused (countdown) or elapsed (stopwatch)
  isFinished: boolean;
}

const DEFAULT_TIMER: TimerState = {
  mode: "countdown",
  totalSeconds: 180,
  startedAt: null,
  pausedRemaining: null,
  isFinished: false,
};

interface ActivityTimerProps {
  toolState: ClassroomToolContext;
}

export function ActivityTimer({ toolState }: ActivityTimerProps) {
  const { useToolValue, isTeacher } = toolState;
  const [timer, setTimer] = useToolValue<TimerState>("timer", DEFAULT_TIMER);
  const [displaySeconds, setDisplaySeconds] = useState(timer.totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = timer.startedAt !== null && !timer.isFinished;

  // Derive display from anchor timestamps
  useEffect(() => {
    const clearTick = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (timer.isFinished) {
      clearTick();
      setDisplaySeconds(timer.mode === "countdown" ? 0 : timer.pausedRemaining ?? 0);
      return;
    }

    if (timer.startedAt === null) {
      clearTick();
      // Paused or not started
      if (timer.pausedRemaining !== null) {
        setDisplaySeconds(timer.pausedRemaining);
      } else {
        setDisplaySeconds(timer.mode === "countdown" ? timer.totalSeconds : 0);
      }
      return;
    }

    // Running: compute from anchor
    const tick = () => {
      const elapsed = Math.floor((Date.now() - timer.startedAt!) / 1000);
      if (timer.mode === "countdown") {
        const base = timer.pausedRemaining ?? timer.totalSeconds;
        const remaining = Math.max(0, base - elapsed);
        setDisplaySeconds(remaining);
        if (remaining <= 0) {
          // Timer finished
          clearTick();
          if (isTeacher) {
            setTimer((prev) => ({ ...prev, startedAt: null, pausedRemaining: 0, isFinished: true }));
            playBeep();
          }
        }
      } else {
        const base = timer.pausedRemaining ?? 0;
        setDisplaySeconds(base + elapsed);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);
    return clearTick;
  }, [timer.startedAt, timer.totalSeconds, timer.mode, timer.isFinished, timer.pausedRemaining, isTeacher]);

  function playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  const start = useCallback(() => {
    if (!isTeacher || timer.isFinished) return;
    setTimer((prev) => ({
      ...prev,
      startedAt: Date.now(),
      isFinished: false,
    }));
  }, [isTeacher, timer.isFinished, setTimer]);

  const pause = useCallback(() => {
    if (!isTeacher || !timer.startedAt) return;
    const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
    if (timer.mode === "countdown") {
      const base = timer.pausedRemaining ?? timer.totalSeconds;
      setTimer((prev) => ({
        ...prev,
        startedAt: null,
        pausedRemaining: Math.max(0, base - elapsed),
      }));
    } else {
      const base = timer.pausedRemaining ?? 0;
      setTimer((prev) => ({
        ...prev,
        startedAt: null,
        pausedRemaining: base + elapsed,
      }));
    }
  }, [isTeacher, timer, setTimer]);

  const reset = useCallback(() => {
    if (!isTeacher) return;
    setTimer((prev) => ({
      ...prev,
      startedAt: null,
      pausedRemaining: null,
      isFinished: false,
    }));
  }, [isTeacher, setTimer]);

  const selectPreset = (seconds: number) => {
    if (!isTeacher) return;
    setTimer((prev) => ({
      ...prev,
      totalSeconds: seconds,
      startedAt: null,
      pausedRemaining: null,
      isFinished: false,
    }));
  };

  const switchMode = (newMode: Mode) => {
    if (!isTeacher) return;
    setTimer({
      mode: newMode,
      totalSeconds: timer.totalSeconds,
      startedAt: null,
      pausedRemaining: null,
      isFinished: false,
    });
  };

  const minutes = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;

  const progress = timer.mode === "countdown" && timer.totalSeconds > 0
    ? displaySeconds / timer.totalSeconds
    : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => switchMode("countdown")}
          disabled={!isTeacher}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            timer.mode === "countdown"
              ? "bg-pastel-ocean text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Countdown
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          disabled={!isTeacher}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            timer.mode === "stopwatch"
              ? "bg-pastel-ocean text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Stopwatch
        </button>
      </div>

      {/* Presets (countdown only) */}
      {timer.mode === "countdown" && !isRunning && !timer.isFinished && isTeacher && (
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => selectPreset(p.seconds)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timer.totalSeconds === p.seconds
                  ? "bg-pastel-ocean text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Timer display */}
      <div className="flex justify-center py-2">
        {timer.mode === "countdown" ? (
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#e5e7eb" strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={timer.isFinished ? "#ef4444" : displaySeconds <= 10 && displaySeconds > 0 ? "#f59e0b" : "#778BEB"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold font-mono ${
                timer.isFinished ? "text-red-500" : displaySeconds <= 10 && displaySeconds > 0 ? "text-amber-500" : "text-gray-900"
              }`}>
                {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-3xl font-bold font-mono text-gray-900 py-4">
            {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Finished message */}
      {timer.isFinished && (
        <p className="text-center text-sm font-semibold text-red-500 animate-pulse">
          Time&#39;s up!
        </p>
      )}

      {/* Controls — teacher only */}
      {isTeacher && (
        <div className="flex gap-2">
          {!isRunning && !timer.isFinished ? (
            <button
              onClick={start}
              className="flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
            >
              Start
            </button>
          ) : isRunning ? (
            <button
              onClick={pause}
              className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Pause
            </button>
          ) : null}
          {(isRunning || timer.isFinished || timer.pausedRemaining !== null) && (
            <button
              onClick={reset}
              className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
