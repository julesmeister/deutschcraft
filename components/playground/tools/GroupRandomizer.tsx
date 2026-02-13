"use client";

import { useState, useCallback, useEffect } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";
import type { PlaygroundParticipant } from "@/lib/models/playground";
import { GroupDisplay } from "./GroupDisplay";

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
  const [persistedGroups, setPersistedGroups] = useToolValue<{ userId: string; userName: string; role?: string }[][]>("groups-result", []);
  const [isIsolated, setIsIsolated] = useToolValue("groups-isolated", false);
  const [teacherListeningTo, setTeacherListeningTo] = useState<number | null>(null);

  // Resolve persisted group assignments against live participants
  const groups: PlaygroundParticipant[][] = persistedGroups.length > 0
    ? persistedGroups.map(group =>
        group
          .map(g => participants.find(p => p.userId === g.userId))
          .filter((p): p is PlaygroundParticipant => p !== undefined)
      ).filter(g => g.length > 0)
    : [];

  const teacherUserIds = new Set(
    participants.filter((p) => p.role === "teacher").map((p) => p.userId)
  );

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
      if (myGroupIndex === -1) {
        audioElements.forEach((el) => { el.muted = false; });
        return;
      }
      const myGroupUserIds = new Set(groups[myGroupIndex].map((p) => p.userId));
      audioElements.forEach((el, peerId) => {
        const isFloating = teacherUserIds.has(peerId) && !groups.some((g) => g.some((p) => p.userId === peerId));
        el.muted = !isFloating && !myGroupUserIds.has(peerId);
      });
    }
  }, [isIsolated, groups, myGroupIndex, teacherListeningTo, teacherJoinsGroup, audioElements, currentUserId, isTeacher, teacherUserIds]);

  // Unmute all on unmount
  useEffect(() => {
    return () => { audioElements?.forEach((el) => { el.muted = false; }); };
  }, [audioElements]);

  const shuffle = useCallback(() => {
    if (!isTeacher) return;
    const toAssign = teacherJoinsGroup
      ? participants
      : participants.filter((p) => p.role !== "teacher");
    const pool = toAssign.length >= 2 ? toAssign : participants;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result: { userId: string; userName: string; role?: string }[][] = Array.from(
      { length: groupCount }, () => []
    );
    shuffled.forEach((p, i) => result[i % groupCount].push({
      userId: p.userId, userName: p.userName, role: p.role,
    }));
    setPersistedGroups(result);
    setTeacherListeningTo(null);
  }, [participants, groupCount, teacherJoinsGroup, isTeacher, setPersistedGroups]);

  const clearGroups = useCallback(() => {
    setPersistedGroups([]);
    setIsIsolated(false);
    setTeacherListeningTo(null);
  }, [setPersistedGroups, setIsIsolated]);

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
        <GroupDisplay
          groups={groups}
          isIsolated={isIsolated}
          isTeacher={isTeacher}
          isFloatingTeacher={isFloatingTeacher}
          teacherJoinsGroup={teacherJoinsGroup}
          teacherListeningTo={teacherListeningTo}
          myGroupIndex={myGroupIndex}
          hasAudio={!!audioElements && !!currentUserId}
          onToggleIsolation={() => {
            if (!isTeacher) return;
            setIsIsolated(!isIsolated);
            if (isIsolated) setTeacherListeningTo(null);
          }}
          onSetListeningTo={setTeacherListeningTo}
        />
      )}
    </div>
  );
}
