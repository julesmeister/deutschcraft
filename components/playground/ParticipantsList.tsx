"use client";

import { useEffect, useState, useRef } from "react";
import type { PlaygroundParticipant } from "@/lib/models/playground";
import type { AudioControlState } from "./audioTypes";
import { updateParticipantVoiceStatus } from "@/lib/services/playgroundService";
import { ParticipantRow } from "./ParticipantRow";

interface ParticipantsListProps {
  participants: PlaygroundParticipant[];
  audioStreams?: Map<string, MediaStream>;
  audioAnalysers?: Map<string, AnalyserNode>;
  audioControl?: AudioControlState;
  userRole?: "teacher" | "student";
  userId?: string;
}

interface ParticipantWithAudio extends PlaygroundParticipant {
  isTalking: boolean;
  audioLevel: number;
}

export function ParticipantsList({
  participants,
  audioStreams,
  audioAnalysers,
  audioControl,
  userRole = "student",
  userId = "",
}: ParticipantsListProps) {
  const [participantsWithAudio, setParticipantsWithAudio] = useState<ParticipantWithAudio[]>([]);
  const [draggingUserId, setDraggingUserId] = useState<string | null>(null);
  const pillRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Ref to read audioControl inside RAF without it being a dependency
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;

  useEffect(() => {
    if (!audioAnalysers || audioAnalysers.size === 0) {
      setParticipantsWithAudio(
        participants.map((p) => ({ ...p, isTalking: false, audioLevel: 0 })),
      );
      return;
    }

    let animationFrameId: number;

    const checkAudioLevels = () => {
      const ctrl = audioControlRef.current;
      const updated = participants.map((p) => {
        // Skip expensive analysis for isolated users
        if (ctrl?.isUserIsolated(p.userId)) {
          return { ...p, isTalking: false, audioLevel: 0 };
        }

        const analyser = audioAnalysers?.get(p.userId);
        if (!analyser || !p.isVoiceActive) {
          return { ...p, isTalking: false, audioLevel: 0 };
        }

        const dataArray = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const audioLevel = Math.sqrt(sum / dataArray.length);
        return { ...p, isTalking: audioLevel > 0.02, audioLevel };
      });

      setParticipantsWithAudio(updated);
      animationFrameId = requestAnimationFrame(checkAudioLevels);
    };

    checkAudioLevels();
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [participants, audioStreams, audioAnalysers]);

  // Drag event listeners for volume control
  useEffect(() => {
    if (!draggingUserId) return;

    const getVolume = (clientX: number) => {
      const pill = pillRefs.current.get(draggingUserId);
      if (!pill) return 1;
      const rect = pill.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };

    const applyVolume = (clientX: number) => {
      const vol = getVolume(clientX);
      if (audioControl) {
        audioControl.setUserVolume(draggingUserId!, vol);
      }
    };

    const onMouseMove = (e: MouseEvent) => applyVolume(e.clientX);
    const onTouchMove = (e: TouchEvent) => applyVolume(e.touches[0].clientX);
    const onEnd = () => setDraggingUserId(null);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [draggingUserId, audioControl]);

  if (participants.length === 0) {
    return <div className="text-center text-gray-500 py-4">No participants yet</div>;
  }

  const handleMute = async (participantId: string, currentIsMuted: boolean) => {
    try {
      await updateParticipantVoiceStatus(participantId, true, !currentIsMuted);
    } catch (error) {
      console.error("[ParticipantsList] Failed to mute participant:", error);
    }
  };

  const handleDragStart = (userId: string, clientX: number) => {
    setDraggingUserId(userId);
    const pill = pillRefs.current.get(userId);
    if (!pill) return;
    const rect = pill.getBoundingClientRect();
    const vol = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (audioControl) {
      audioControl.setUserVolume(userId, vol);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {participantsWithAudio.map((p) => (
          <div
            key={p.participantId}
            ref={(el) => { if (el) pillRefs.current.set(p.userId, el); }}
          >
            <ParticipantRow
              participant={p}
              isCurrentUser={p.userId === userId}
              canMute={userRole === "teacher" && p.userId !== userId}
              volume={audioControl?.getUserVolume(p.userId) ?? 1}
              isDragging={draggingUserId === p.userId}
              isIsolated={audioControl?.isUserIsolated(p.userId)}
              onMute={handleMute}
              onDragStart={handleDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
