"use client";

import { useLocalStorage } from "./tools/useLocalStorage";
import { useClassroomToolState } from "./tools/useClassroomToolState";
import { DiceRoller } from "./tools/DiceRoller";
import { GroupRandomizer } from "./tools/GroupRandomizer";
import { StudentPicker } from "./tools/StudentPicker";
import { ActivityTimer } from "./tools/ActivityTimer";
import { Scoreboard } from "./tools/Scoreboard";
import type { PlaygroundParticipant } from "@/lib/models/playground";
import type { AudioControlState, GroupIsolationState } from "./audioTypes";

type ToolTab = "dice" | "groups" | "picker" | "timer" | "score";

const TABS: { key: ToolTab; label: string; icon: string; activeClass: string }[] = [
  { key: "dice", label: "Dice", icon: "🎲", activeClass: "bg-amber-100 text-amber-800" },
  { key: "groups", label: "Groups", icon: "👥", activeClass: "bg-blue-100 text-blue-800" },
  { key: "picker", label: "Picker", icon: "🎯", activeClass: "bg-rose-100 text-rose-800" },
  { key: "timer", label: "Timer", icon: "⏱", activeClass: "bg-teal-100 text-teal-800" },
  { key: "score", label: "Score", icon: "🏆", activeClass: "bg-purple-100 text-purple-800" },
];

interface ClassroomToolsProps {
  participants: PlaygroundParticipant[];
  audioControl?: AudioControlState;
  currentUserId?: string;
  userRole?: "teacher" | "student";
  roomId: string;
  onIsolationChange: (state: GroupIsolationState) => void;
}

export function ClassroomTools({ participants, audioControl, currentUserId, userRole, roomId, onIsolationChange }: ClassroomToolsProps) {
  const [isOpen, setIsOpen] = useLocalStorage("tools-open", false);
  const [activeTab, setActiveTab] = useLocalStorage<ToolTab>("tools-active-tab", "dice");

  const toolState = useClassroomToolState({
    roomId,
    userRole: userRole || "student",
    currentUserId: currentUserId || "",
  });

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-neutral-900">
          Classroom Tools
        </h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Tab chips */}
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? `${tab.activeClass} shadow-sm`
                    : "bg-gray-100/80 text-gray-500 hover:bg-gray-200/80"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* All tools rendered, hidden when inactive to preserve state */}
          <div className={activeTab === "dice" ? "" : "hidden"}>
            <DiceRoller toolState={toolState} />
          </div>
          <div className={activeTab === "groups" ? "" : "hidden"}>
            <GroupRandomizer
              participants={participants}
              hasAudio={!!audioControl && audioControl.audioElements.size > 0}
              currentUserId={currentUserId}
              userRole={userRole}
              toolState={toolState}
              onIsolationChange={onIsolationChange}
            />
          </div>
          <div className={activeTab === "picker" ? "" : "hidden"}>
            <StudentPicker participants={participants} toolState={toolState} />
          </div>
          <div className={activeTab === "timer" ? "" : "hidden"}>
            <ActivityTimer toolState={toolState} />
          </div>
          <div className={activeTab === "score" ? "" : "hidden"}>
            <Scoreboard participants={participants} toolState={toolState} />
          </div>
        </div>
      )}
    </div>
  );
}
