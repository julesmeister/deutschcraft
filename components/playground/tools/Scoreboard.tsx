"use client";

import { useCallback } from "react";
import type { ClassroomToolContext } from "./useClassroomToolState";
import type { PlaygroundParticipant } from "@/lib/models/playground";

type ScoreMode = "individual" | "teams";

interface TeamScore {
  name: string;
  score: number;
  color: string;
}

const TEAM_COLORS = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700"];

interface ScoreboardProps {
  participants: PlaygroundParticipant[];
  toolState: ClassroomToolContext;
}

export function Scoreboard({ participants, toolState }: ScoreboardProps) {
  const { useToolValue, isTeacher } = toolState;
  const [mode, setMode] = useToolValue<ScoreMode>("score-mode", "individual");
  const [scores, setScores] = useToolValue<Record<string, number>>("score-individual", {});
  const [teams, setTeams] = useToolValue<TeamScore[]>("score-teams", [
    { name: "Team A", score: 0, color: TEAM_COLORS[0] },
    { name: "Team B", score: 0, color: TEAM_COLORS[1] },
  ]);
  const [teamCount, setTeamCount] = useToolValue("score-team-count", 2);

  // Individual scoring
  const addPoints = useCallback((userId: string, points: number) => {
    if (!isTeacher) return;
    setScores((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + points,
    }));
  }, [setScores, isTeacher]);

  const resetScores = useCallback(() => {
    if (!isTeacher) return;
    setScores({});
  }, [setScores, isTeacher]);

  // Team scoring
  const addTeamPoints = useCallback((index: number, points: number) => {
    if (!isTeacher) return;
    setTeams((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, score: Math.max(0, t.score + points) } : t
      )
    );
  }, [setTeams, isTeacher]);

  const resetTeams = useCallback(() => {
    if (!isTeacher) return;
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
  }, [setTeams, isTeacher]);

  const updateTeamCount = (count: number) => {
    if (!isTeacher) return;
    setTeamCount(count);
    const names = ["Team A", "Team B", "Team C", "Team D"];
    setTeams(
      Array.from({ length: count }, (_, i) => ({
        name: names[i],
        score: 0,
        color: TEAM_COLORS[i],
      }))
    );
  };

  // Sorted participants by score
  const sortedParticipants = [...participants]
    .filter((p) => p.role !== "teacher")
    .sort((a, b) => (scores[b.userId] || 0) - (scores[a.userId] || 0));

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => isTeacher && setMode("individual")}
          disabled={!isTeacher}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === "individual"
              ? "bg-pastel-ocean text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Individual
        </button>
        <button
          onClick={() => isTeacher && setMode("teams")}
          disabled={!isTeacher}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === "teams"
              ? "bg-pastel-ocean text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Teams
        </button>
      </div>

      {mode === "individual" ? (
        <>
          {sortedParticipants.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No students in the room.
            </p>
          ) : (
            <div className="space-y-1.5">
              {sortedParticipants.map((p, rank) => {
                const pts = scores[p.userId] || 0;
                return (
                  <div
                    key={p.userId}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className={`text-xs font-bold w-5 text-center ${
                      rank === 0 && pts > 0 ? "text-amber-500" : "text-gray-400"
                    }`}>
                      {rank === 0 && pts > 0 ? "1st" : `${rank + 1}`}
                    </span>
                    <span className="flex-1 text-sm text-gray-800 truncate">
                      {p.userName}
                    </span>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">
                      {pts}
                    </span>
                    {isTeacher && (
                      <div className="flex gap-0.5 ml-1">
                        <button
                          onClick={() => addPoints(p.userId, -1)}
                          className="w-6 h-6 rounded bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          -
                        </button>
                        <button
                          onClick={() => addPoints(p.userId, 1)}
                          className="w-6 h-6 rounded bg-green-100 text-green-600 text-xs font-bold hover:bg-green-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {sortedParticipants.length > 0 && isTeacher && (
            <button
              onClick={resetScores}
              className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Reset All Scores
            </button>
          )}
        </>
      ) : (
        <>
          {/* Team count */}
          {isTeacher && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Teams</span>
              <div className="flex gap-1">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateTeamCount(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      teamCount === n
                        ? "bg-pastel-ocean text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team scores */}
          <div className="space-y-2">
            {teams.map((team, i) => (
              <div
                key={i}
                className={`${team.color} rounded-lg px-3 py-3 flex items-center gap-2`}
              >
                <span className="flex-1 text-sm font-semibold">{team.name}</span>
                <span className="text-2xl font-bold w-12 text-center">{team.score}</span>
                {isTeacher && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => addTeamPoints(i, 1)}
                      className="w-7 h-7 rounded bg-white/50 text-xs font-bold hover:bg-white/80 transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => addTeamPoints(i, -1)}
                      className="w-7 h-7 rounded bg-white/50 text-xs font-bold hover:bg-white/80 transition-colors"
                    >
                      -
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isTeacher && (
            <button
              onClick={resetTeams}
              className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Reset All Scores
            </button>
          )}
        </>
      )}
    </div>
  );
}
