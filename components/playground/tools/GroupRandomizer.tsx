"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";
import type { PlaygroundParticipant } from "@/lib/models/playground";
import type { GroupIsolationState } from "../audioTypes";
import { GroupDisplay } from "./GroupDisplay";

interface GroupRandomizerProps {
  participants: PlaygroundParticipant[];
  hasAudio: boolean;
  currentUserId?: string;
  userRole?: "teacher" | "student";
  toolState: ClassroomToolContext;
  onIsolationChange: (state: GroupIsolationState) => void;
}

export function GroupRandomizer({
  participants,
  hasAudio,
  currentUserId,
  userRole,
  toolState,
  onIsolationChange,
}: GroupRandomizerProps) {
  const { useToolValue, isTeacher } = toolState;
  const [groupCount, setGroupCount] = useToolValue("groups-count", 2);
  const [teacherJoinsGroup, setTeacherJoinsGroup] = useToolValue("groups-teacher-joins", false);
  const [persistedGroups, setPersistedGroups] = useToolValue<{ userId: string; userName: string; role?: string }[][]>("groups-result", []);
  const [isIsolated, setIsIsolated] = useToolValue("groups-isolated", false);
  const [teacherListeningTo, setTeacherListeningTo] = useState<number | null>(null);

  // Resolve persisted group assignments against live participants (memoized to prevent re-render loops)
  const groups: PlaygroundParticipant[][] = useMemo(() =>
    persistedGroups.length > 0
      ? persistedGroups.map(group =>
          group
            .map(g => participants.find(p => p.userId === g.userId))
            .filter((p): p is PlaygroundParticipant => p !== undefined)
        ).filter(g => g.length > 0)
      : [],
    [persistedGroups, participants],
  );

  const teacherUserIds = useMemo(() => new Set(
    participants.filter((p) => p.role === "teacher").map((p) => p.userId)
  ), [participants]);

  const myGroupIndex = groups.findIndex((g) =>
    g.some((p) => p.userId === currentUserId)
  );

  // Compute and emit isolation state
  useEffect(() => {
    if (!currentUserId || groups.length === 0 || !isIsolated) {
      onIsolationChange({ isIsolated: false, mutedUserIds: new Set(), myGroupIndex: -1 });
      return;
    }

    const mutedUserIds = new Set<string>();
    const allUserIds = new Set<string>();
    participants.forEach(p => allUserIds.add(p.userId));

    if (isTeacher && !teacherJoinsGroup) {
      // Floating teacher
      if (teacherListeningTo !== null) {
        const listenGroupUserIds = new Set(
          groups[teacherListeningTo]?.map((p) => p.userId) || []
        );
        allUserIds.forEach(uid => {
          if (uid !== currentUserId && !listenGroupUserIds.has(uid)) {
            mutedUserIds.add(uid);
          }
        });
      }
      // teacherListeningTo === null → hear everyone, no mutes
    } else {
      if (myGroupIndex === -1) {
        onIsolationChange({ isIsolated: false, mutedUserIds: new Set(), myGroupIndex: -1 });
        return;
      }
      const myGroupUserIds = new Set(groups[myGroupIndex].map((p) => p.userId));
      allUserIds.forEach(uid => {
        if (uid === currentUserId) return;
        const isFloating = teacherUserIds.has(uid) && !groups.some((g) => g.some((p) => p.userId === uid));
        if (!isFloating && !myGroupUserIds.has(uid)) {
          mutedUserIds.add(uid);
        }
      });
    }

    onIsolationChange({ isIsolated: true, mutedUserIds, myGroupIndex });
  }, [isIsolated, groups, myGroupIndex, teacherListeningTo, teacherJoinsGroup, currentUserId, isTeacher, teacherUserIds, participants, onIsolationChange]);

  // Cleanup: clear isolation on unmount
  useEffect(() => {
    return () => {
      onIsolationChange({ isIsolated: false, mutedUserIds: new Set(), myGroupIndex: -1 });
    };
  }, [onIsolationChange]);

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

  const handleSwapMembers = useCallback((groupA: number, userIdA: string, groupB: number, userIdB: string) => {
    if (!isTeacher) return;
    setPersistedGroups(prev => {
      const next = prev.map(g => [...g]);
      const idxA = next[groupA]?.findIndex(m => m.userId === userIdA);
      const idxB = next[groupB]?.findIndex(m => m.userId === userIdB);
      if (idxA === -1 || idxB === -1 || idxA === undefined || idxB === undefined) return prev;
      const temp = next[groupA][idxA];
      next[groupA][idxA] = next[groupB][idxB];
      next[groupB][idxB] = temp;
      return next;
    });
  }, [isTeacher, setPersistedGroups]);

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
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => { if (!isTeacher) return; setGroupCount(n); clearGroups(); }}
              disabled={!isTeacher}
              className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                groupCount === n
                  ? "bg-blue-100 text-blue-800 shadow-sm"
                  : "bg-gray-100/80 text-gray-500 hover:bg-gray-200/80"
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
          className="w-full py-2.5 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
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
          hasAudio={hasAudio}
          onToggleIsolation={() => {
            if (!isTeacher) return;
            setIsIsolated(!isIsolated);
            if (isIsolated) setTeacherListeningTo(null);
          }}
          onSetListeningTo={setTeacherListeningTo}
          onSwapMembers={isTeacher ? handleSwapMembers : undefined}
        />
      )}
    </div>
  );
}
