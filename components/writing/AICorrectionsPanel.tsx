/**
 * AICorrectionsPanel Component
 * Allows students to submit AI-corrected versions of their work
 * Designed to look like the exercise workspace
 */

"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/toast";
import { DiffTextCorrectedOnly } from "./DiffText";

interface AICorrectionsPanelProps {
  submissionId: string;
  currentAICorrection?: string;
  currentAICorrectedAt?: number;
  originalText: string; // Student's original text for comparison
  onSave: (correctedText: string) => Promise<void>;
  isEditing?: boolean;
  onEditChange?: (isEditing: boolean) => void;
}

export function AICorrectionsPanel({
  submissionId,
  currentAICorrection,
  currentAICorrectedAt,
  originalText,
  onSave,
  isEditing: externalIsEditing,
  onEditChange,
}: AICorrectionsPanelProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);

  const isEditing =
    externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = (value: boolean) => {
    if (onEditChange) {
      onEditChange(value);
    } else {
      setInternalIsEditing(value);
    }
  };

  const [correctedText, setCorrectedText] = useState(currentAICorrection || "");
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!correctedText.trim()) return;

    try {
      setIsSaving(true);
      await onSave(correctedText);
      setIsEditing(false);
      toast.success("AI correction saved successfully!", { duration: 3000 });
    } catch (err) {
      console.error("Error saving AI correction:", err);
      toast.error("Failed to save AI correction. Please try again.", {
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCorrectedText(currentAICorrection || "");
    setIsEditing(false);
  };

  if (!isEditing && !currentAICorrection) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-gray-500 hover:text-purple-600 font-medium flex items-center gap-1.5 transition-colors"
      >
        <span>+ Add AI-corrected version</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={correctedText}
            onChange={(e) => setCorrectedText(e.target.value)}
            placeholder="Paste the AI-corrected version here..."
            className="w-full bg-transparent border-none outline-none resize-none text-base leading-relaxed text-gray-900 placeholder-gray-400"
            style={{
              minHeight: "120px",
              lineHeight: "1.6",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            autoFocus
          />
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !correctedText.trim()}
              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <DiffTextCorrectedOnly
            originalText={originalText}
            correctedText={currentAICorrection!}
            className="text-base"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            {currentAICorrectedAt && (
              <p className="text-xs text-gray-500">
                Saved{" "}
                {new Date(currentAICorrectedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
