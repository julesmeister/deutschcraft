"use client";

import { useState, useCallback } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";
import type { PlaygroundParticipant } from "@/lib/models/playground";

interface StudentPickerProps {
  participants: PlaygroundParticipant[];
  toolState: ClassroomToolContext;
}

export function StudentPicker({ participants, toolState }: StudentPickerProps) {
  const { useToolValue, isTeacher } = toolState;
  const [pickedIds, setPickedIds] = useToolValue<string[]>("picker-picked", []);
  const [currentId, setCurrentId] = useToolValue<string | null>("picker-current", null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Derive remaining from participants minus picked
  const pickedSet = new Set(pickedIds);
  const remaining = participants.filter((p) => !pickedSet.has(p.userId));
  const picked = pickedIds
    .map((id) => participants.find((p) => p.userId === id))
    .filter(Boolean) as PlaygroundParticipant[];
  const current = participants.find((p) => p.userId === currentId) || null;

  const pick = useCallback(() => {
    if (!isTeacher || remaining.length === 0) return;
    setIsAnimating(true);

    let count = 0;
    const flashInterval = setInterval(() => {
      const rand = remaining[Math.floor(Math.random() * remaining.length)];
      setCurrentId(rand.userId);
      count++;
      if (count > 6) {
        clearInterval(flashInterval);
        const idx = Math.floor(Math.random() * remaining.length);
        const chosen = remaining[idx];
        setCurrentId(chosen.userId);
        setPickedIds((prev) => [...prev, chosen.userId]);
        setIsAnimating(false);
      }
    }, 80);
  }, [remaining, setCurrentId, setPickedIds, isTeacher]);

  const reset = useCallback(() => {
    if (!isTeacher) return;
    setPickedIds([]);
    setCurrentId(null);
  }, [setPickedIds, setCurrentId, isTeacher]);

  if (participants.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No participants to pick from.
      </p>
    );
  }

  const allPicked = remaining.length === 0;

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {allPicked ? "All picked!" : `${remaining.length} student${remaining.length !== 1 ? "s" : ""} left`}
        </span>
        {picked.length > 0 && isTeacher && (
          <button
            onClick={reset}
            className="text-xs text-pastel-ocean hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Current pick display */}
      {current && (
        <div
          className={`text-center py-4 rounded-2xl transition-all ${
            isAnimating
              ? "bg-gray-100/80"
              : "bg-rose-50"
          }`}
        >
          <p className={`text-lg font-bold ${isAnimating ? "text-gray-400" : "text-rose-700"}`}>
            {current.userName}
          </p>
        </div>
      )}

      {/* Pick button */}
      {isTeacher && (
        <button
          onClick={pick}
          disabled={allPicked || isAnimating}
          className="w-full py-2.5 rounded-full bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 transition-colors"
        >
          {isAnimating ? "Picking..." : allPicked ? "All Picked!" : "Pick a Student"}
        </button>
      )}

      {/* Picked list */}
      {picked.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Already picked:</p>
          <div className="flex flex-wrap gap-1">
            {picked.map((p, i) => (
              <span
                key={p.userId}
                className="text-xs bg-gray-100/80 rounded-full px-2.5 py-0.5 text-gray-500"
              >
                {i + 1}. {p.userName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
