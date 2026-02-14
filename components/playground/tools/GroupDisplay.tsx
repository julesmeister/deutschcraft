"use client";

import { useState } from "react";
import type { PlaygroundParticipant } from "@/lib/models/playground";

const GROUP_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-700" },
  { bg: "bg-green-50", border: "border-green-200", label: "text-green-700" },
  { bg: "bg-amber-50", border: "border-amber-200", label: "text-amber-700" },
  { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-700" },
  { bg: "bg-rose-50", border: "border-rose-200", label: "text-rose-700" },
  { bg: "bg-cyan-50", border: "border-cyan-200", label: "text-cyan-700" },
];

interface GroupDisplayProps {
  groups: PlaygroundParticipant[][];
  isIsolated: boolean;
  isTeacher: boolean;
  isFloatingTeacher: boolean;
  teacherJoinsGroup: boolean;
  teacherListeningTo: number | null;
  myGroupIndex: number;
  hasAudio: boolean;
  onToggleIsolation: () => void;
  onSetListeningTo: (group: number | null) => void;
  onSwapMembers?: (groupA: number, userIdA: string, groupB: number, userIdB: string) => void;
}

interface SelectedMember {
  groupIndex: number;
  userId: string;
  userName: string;
}

export function GroupDisplay({
  groups,
  isIsolated,
  isTeacher,
  isFloatingTeacher,
  teacherJoinsGroup,
  teacherListeningTo,
  myGroupIndex,
  hasAudio,
  onToggleIsolation,
  onSetListeningTo,
  onSwapMembers,
}: GroupDisplayProps) {
  const [selected, setSelected] = useState<SelectedMember | null>(null);

  const handleMemberClick = (groupIndex: number, p: PlaygroundParticipant) => {
    if (!isTeacher || !onSwapMembers) return;

    if (!selected) {
      setSelected({ groupIndex, userId: p.userId, userName: p.userName });
      return;
    }

    if (selected.userId === p.userId) {
      setSelected(null);
      return;
    }

    if (selected.groupIndex === groupIndex) {
      // Same group — just reselect
      setSelected({ groupIndex, userId: p.userId, userName: p.userName });
      return;
    }

    // Different groups — swap
    onSwapMembers(selected.groupIndex, selected.userId, groupIndex, p.userId);
    setSelected(null);
  };

  return (
    <>
      {/* Audio isolation toggle */}
      {hasAudio && (
        <button
          onClick={onToggleIsolation}
          disabled={!isTeacher}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            isIsolated
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
          } ${!isTeacher ? "opacity-75 cursor-default" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isIsolated ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-1.464A5 5 0 018.464 8.464M19.07 4.93a10 10 0 010 14.14M5.93 4.93a10 10 0 000 14.14" />
            )}
          </svg>
          {isIsolated ? "Audio Isolated" : "Isolate Audio by Group"}
        </button>
      )}

      {/* Floating teacher: group listening selector */}
      {isIsolated && isFloatingTeacher && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-700 mb-2">Listening to:</p>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => onSetListeningTo(null)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                teacherListeningTo === null ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              All
            </button>
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => onSetListeningTo(i)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  teacherListeningTo === i ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                Group {i + 1}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-indigo-500 mt-1.5">All groups can always hear you.</p>
        </div>
      )}

      {/* Info messages */}
      {isIsolated && isTeacher && teacherJoinsGroup && myGroupIndex !== -1 && (
        <p className="text-[11px] text-gray-500 text-center">
          You are in Group {myGroupIndex + 1}. Only your group can hear you.
        </p>
      )}
      {isIsolated && !isTeacher && (
        <p className="text-[11px] text-gray-500 text-center">
          You can hear your group{!teacherJoinsGroup ? " + the teacher" : ""}.
        </p>
      )}

      {/* Swap hint */}
      {selected && (
        <p className="text-[11px] text-pastel-ocean text-center font-semibold animate-pulse">
          Tap someone in another group to swap with {selected.userName}
        </p>
      )}

      {/* Group cards */}
      <div className="space-y-2">
        {groups.map((group, i) => {
          const color = GROUP_COLORS[i % GROUP_COLORS.length];
          const isMyGroup = i === myGroupIndex;
          const isMuted = isIsolated && !isMyGroup && !isFloatingTeacher;
          const isMutedFloating = isIsolated && isFloatingTeacher && teacherListeningTo !== null && teacherListeningTo !== i;
          return (
            <div
              key={i}
              className={`${color.bg} ${color.border} border rounded-lg p-3 transition-all ${
                isIsolated && isMyGroup ? "ring-2 ring-offset-1 ring-pastel-ocean" : ""
              } ${isIsolated && isFloatingTeacher && teacherListeningTo === i ? "ring-2 ring-offset-1 ring-indigo-400" : ""}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <p className={`text-xs font-bold ${color.label}`}>Group {i + 1}</p>
                {isIsolated && isMyGroup && (
                  <span className="text-[10px] bg-white/80 text-pastel-ocean font-semibold rounded px-1.5 py-0.5">Your group</span>
                )}
                {isIsolated && isFloatingTeacher && teacherListeningTo === i && (
                  <span className="text-[10px] bg-white/80 text-indigo-600 font-semibold rounded px-1.5 py-0.5">Listening</span>
                )}
                {(isMuted || isMutedFloating) && (
                  <span className="text-[10px] bg-white/60 text-gray-400 rounded px-1.5 py-0.5">Muted</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {group.map((p) => {
                  const isSelected = selected?.userId === p.userId;
                  const isSwapTarget = selected && selected.groupIndex !== i;
                  return (
                    <button
                      key={p.userId}
                      onClick={() => handleMemberClick(i, p)}
                      disabled={!isTeacher || !onSwapMembers}
                      className={`text-xs rounded px-2 py-0.5 transition-all ${
                        isSelected
                          ? "bg-pastel-ocean text-white ring-2 ring-pastel-ocean ring-offset-1"
                          : isMuted || isMutedFloating
                            ? "bg-white/40 text-gray-400 line-through"
                            : isTeacher && isSwapTarget
                              ? "bg-white/70 text-gray-700 hover:bg-pastel-ocean/20 hover:ring-1 hover:ring-pastel-ocean cursor-pointer"
                              : isTeacher
                                ? "bg-white/70 text-gray-700 hover:bg-white cursor-pointer"
                                : "bg-white/70 text-gray-700"
                      }`}
                    >
                      {p.userName}
                      {p.role === "teacher" && <span className="text-[9px] ml-0.5 opacity-60">(T)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
