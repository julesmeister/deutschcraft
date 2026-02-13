"use client";

import { useState, useCallback, useEffect } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";
import type { PlaygroundParticipant } from "@/lib/models/playground";

const GROUP_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-700" },
  { bg: "bg-green-50", border: "border-green-200", label: "text-green-700" },
  { bg: "bg-amber-50", border: "border-amber-200", label: "text-amber-700" },
  { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-700" },
];

interface GroupRandomizerProps {
  participants: PlaygroundParticipant[];
  audioElements?: Map<string, HTMLAudioElement>;
  currentUserId?: string;
  userRole?: "teacher" | "student";
  toolState: ClassroomToolContext;
}

export function GroupRandomizer({
  participants,
  audioElements,
  currentUserId,
  userRole,
  toolState,
}: GroupRandomizerProps) {
  const { useToolValue, isTeacher } = toolState;
  const [groupCount, setGroupCount] = useToolValue("groups-count", 2);
  const [teacherJoinsGroup, setTeacherJoinsGroup] = useToolValue("groups-teacher-joins", false);
  // Persisted group assignments: array of arrays of { userId, userName }
  const [persistedGroups, setPersistedGroups] = useToolValue<{ userId: string; userName: string; role?: string }[][]>("groups-result", []);
  const [isIsolated, setIsIsolated] = useState(false);
  const [teacherListeningTo, setTeacherListeningTo] = useState<number | null>(null);

  // Resolve persisted group assignments against live participants
  const groups: PlaygroundParticipant[][] = persistedGroups.length > 0
    ? persistedGroups.map(group =>
        group
          .map(g => participants.find(p => p.userId === g.userId))
          .filter((p): p is PlaygroundParticipant => p !== undefined)
      ).filter(g => g.length > 0)
    : [];

  // Find teacher userId(s) from participants
  const teacherUserIds = new Set(
    participants.filter((p) => p.role === "teacher").map((p) => p.userId)
  );

  // Find which group the current user is in
  const myGroupIndex = groups.findIndex((g) =>
    g.some((p) => p.userId === currentUserId)
  );

  // Apply audio isolation
  useEffect(() => {
    if (!audioElements || !currentUserId) return;

    if (!isIsolated || groups.length === 0) {
      audioElements.forEach((el) => { el.muted = false; });
      return;
    }

    if (isTeacher && !teacherJoinsGroup) {
      // Floating teacher: hears selected group or all
      if (teacherListeningTo === null) {
        audioElements.forEach((el) => { el.muted = false; });
      } else {
        const listenGroupUserIds = new Set(
          groups[teacherListeningTo]?.map((p) => p.userId) || []
        );
        audioElements.forEach((el, peerId) => {
          el.muted = !listenGroupUserIds.has(peerId);
        });
      }
    } else {
      // Student OR teacher-in-group: hear own group + all teachers (if not in group)
      if (myGroupIndex === -1) {
        audioElements.forEach((el) => { el.muted = false; });
        return;
      }
      const myGroupUserIds = new Set(
        groups[myGroupIndex].map((p) => p.userId)
      );
      audioElements.forEach((el, peerId) => {
        const isFloatingTeacher = teacherUserIds.has(peerId) && !groups.some((g) => g.some((p) => p.userId === peerId));
        el.muted = !isFloatingTeacher && !myGroupUserIds.has(peerId);
      });
    }
  }, [isIsolated, groups, myGroupIndex, teacherListeningTo, teacherJoinsGroup, audioElements, currentUserId, isTeacher, teacherUserIds]);

  // Clean up: unmute all when component unmounts
  useEffect(() => {
    return () => {
      audioElements?.forEach((el) => { el.muted = false; });
    };
  }, [audioElements]);

  const shuffle = useCallback(() => {
    if (!isTeacher) return;
    const toAssign = teacherJoinsGroup
      ? participants
      : participants.filter((p) => p.role !== "teacher");
    // Fallback: if filtering leaves < 2, use all
    const pool = toAssign.length >= 2 ? toAssign : participants;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result: { userId: string; userName: string; role?: string }[][] = Array.from(
      { length: groupCount },
      () => []
    );
    shuffled.forEach((p, i) => result[i % groupCount].push({
      userId: p.userId,
      userName: p.userName,
      role: p.role,
    }));
    setPersistedGroups(result);
    setTeacherListeningTo(null);
  }, [participants, groupCount, teacherJoinsGroup, isTeacher, setPersistedGroups]);

  const clearGroups = useCallback(() => {
    setPersistedGroups([]);
    setIsIsolated(false);
    setTeacherListeningTo(null);
  }, [setPersistedGroups]);

  if (participants.length < 2) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Need at least 2 participants to form groups.
      </p>
    );
  }

  const isFloatingTeacher = isTeacher && !teacherJoinsGroup;

  return (
    <div className="space-y-3">
      {/* Group count selector */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Number of groups</span>
        <div className="flex gap-1">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => { if (!isTeacher) return; setGroupCount(n); clearGroups(); }}
              disabled={!isTeacher}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                groupCount === n
                  ? "bg-pastel-ocean text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher: join group toggle */}
      {isTeacher && (
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-600">Join a group</span>
          <button
            onClick={() => { setTeacherJoinsGroup(!teacherJoinsGroup); clearGroups(); }}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              teacherJoinsGroup ? "bg-pastel-ocean" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                teacherJoinsGroup ? "translate-x-5" : ""
              }`}
            />
          </button>
        </label>
      )}

      {/* Shuffle button */}
      {isTeacher && (
        <button
          onClick={shuffle}
          className="w-full py-2 rounded-lg bg-pastel-ocean text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {groups.length > 0 ? "Re-shuffle" : "Shuffle"}
        </button>
      )}

      {/* Groups display */}
      {groups.length > 0 && (
        <>
          {/* Audio isolation toggle */}
          {audioElements && currentUserId && (
            <button
              onClick={() => {
                setIsIsolated(!isIsolated);
                if (isIsolated) setTeacherListeningTo(null);
              }}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                isIsolated
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
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
              <p className="text-xs font-semibold text-indigo-700 mb-2">
                Listening to:
              </p>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setTeacherListeningTo(null)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    teacherListeningTo === null
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  All
                </button>
                {groups.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTeacherListeningTo(i)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      teacherListeningTo === i
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    Group {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-indigo-500 mt-1.5">
                All groups can always hear you.
              </p>
            </div>
          )}

          {/* Teacher in group: info */}
          {isIsolated && isTeacher && teacherJoinsGroup && myGroupIndex !== -1 && (
            <p className="text-[11px] text-gray-500 text-center">
              You are in Group {myGroupIndex + 1}. Only your group can hear you.
            </p>
          )}

          {/* Student: info */}
          {isIsolated && !isTeacher && (
            <p className="text-[11px] text-gray-500 text-center">
              You can hear your group{!teacherJoinsGroup ? " + the teacher" : ""}.
            </p>
          )}

          <div className="space-y-2">
            {groups.map((group, i) => {
              const color = GROUP_COLORS[i % GROUP_COLORS.length];
              const isMyGroup = i === myGroupIndex;
              const isMutedForMe = isIsolated && !isMyGroup && (!isFloatingTeacher);
              const isMutedForFloatingTeacher = isIsolated && isFloatingTeacher && teacherListeningTo !== null && teacherListeningTo !== i;
              return (
                <div
                  key={i}
                  className={`${color.bg} ${color.border} border rounded-lg p-3 transition-all ${
                    isIsolated && isMyGroup ? "ring-2 ring-offset-1 ring-pastel-ocean" : ""
                  } ${isIsolated && isFloatingTeacher && teacherListeningTo === i ? "ring-2 ring-offset-1 ring-indigo-400" : ""}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className={`text-xs font-bold ${color.label}`}>
                      Group {i + 1}
                    </p>
                    {isIsolated && isMyGroup && (
                      <span className="text-[10px] bg-white/80 text-pastel-ocean font-semibold rounded px-1.5 py-0.5">
                        Your group
                      </span>
                    )}
                    {isIsolated && isFloatingTeacher && teacherListeningTo === i && (
                      <span className="text-[10px] bg-white/80 text-indigo-600 font-semibold rounded px-1.5 py-0.5">
                        Listening
                      </span>
                    )}
                    {isMutedForMe && (
                      <span className="text-[10px] bg-white/60 text-gray-400 rounded px-1.5 py-0.5">
                        Muted
                      </span>
                    )}
                    {isMutedForFloatingTeacher && (
                      <span className="text-[10px] bg-white/60 text-gray-400 rounded px-1.5 py-0.5">
                        Muted
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.map((p) => (
                      <span
                        key={p.userId}
                        className={`text-xs rounded px-2 py-0.5 ${
                          isMutedForMe || isMutedForFloatingTeacher
                            ? "bg-white/40 text-gray-400 line-through"
                            : "bg-white/70 text-gray-700"
                        }`}
                      >
                        {p.userName}
                        {p.role === "teacher" && (
                          <span className="text-[9px] ml-0.5 opacity-60">(T)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
