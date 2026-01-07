/**
 * GermanCharAutocomplete Component
 * Provides autocomplete suggestions for German umlaut and special characters
 *
 * Replacements:
 * - ae → ä
 * - oe → ö
 * - ue → ü
 * - Ae → Ä
 * - Oe → Ö
 * - Ue → Ü
 * - ss → ß
 * - Ss → ß (for capitalized input fields)
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Suggestion {
  trigger: string;
  replacement: string;
  display: string;
}

const GERMAN_SUGGESTIONS: Suggestion[] = [
  { trigger: "ae", replacement: "ä", display: "ae → ä" },
  { trigger: "oe", replacement: "ö", display: "oe → ö" },
  { trigger: "ue", replacement: "ü", display: "ue → ü" },
  { trigger: "Ae", replacement: "Ä", display: "Ae → Ä" },
  { trigger: "Oe", replacement: "Ö", display: "Oe → Ö" },
  { trigger: "Ue", replacement: "Ü", display: "Ue → Ü" },
  { trigger: "ss", replacement: "ß", display: "ss → ß" },
  { trigger: "Ss", replacement: "ß", display: "Ss → ß" },
];

interface GermanCharAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  content: string;
  onContentChange: (newContent: string) => void;
}

export function GermanCharAutocomplete({
  textareaRef,
  content,
  onContentChange,
}: GermanCharAutocompleteProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(
    null
  );
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
  });
  const [triggerStartPos, setTriggerStartPos] = useState(0);

  const updatePosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const rect = textarea.getBoundingClientRect();
    const textareaStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(textareaStyle.lineHeight) || 20;

    // Check if it's an input field (single line) or textarea (multi-line)
    const isInput = textarea.tagName === "INPUT";

    // Position below the field - more offset for input to avoid blocking text
    const verticalOffset = isInput ? rect.height + 8 : lineHeight;

    setSuggestionPosition({
      top: rect.top + verticalOffset, // Use viewport coordinates for fixed positioning
      left: rect.left + 20,
    });
  }, [textareaRef]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!showSuggestion) return;

    const handleScroll = () => updatePosition();

    // Use capture to detect scroll in any container
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [showSuggestion, updatePosition]);

  // Check for trigger patterns as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;

    // Get text before cursor
    const textBeforeCursor = content.substring(0, cursorPos);

    // Check for trigger patterns at cursor position
    for (const suggestion of GERMAN_SUGGESTIONS) {
      const triggerLength = suggestion.trigger.length;
      const potentialTrigger = textBeforeCursor.slice(-triggerLength);

      if (potentialTrigger === suggestion.trigger) {
        // Check that we're not in the middle of typing a longer sequence
        // (e.g., don't trigger "ae" if user is typing "aero")
        const charAfterCursor = content.charAt(cursorPos);
        const isAtWordEnd =
          !charAfterCursor || /[\s,.\-!?;:()\[\]{}]/.test(charAfterCursor);

        if (isAtWordEnd) {
          setCurrentSuggestion(suggestion);
          setTriggerStartPos(cursorPos - triggerLength);
          setShowSuggestion(true);
          updatePosition();
          return;
        }
      }
    }

    // No trigger found
    setShowSuggestion(false);
    setCurrentSuggestion(null);
  }, [content, textareaRef, updatePosition]);

  // Handle keyboard events
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestion || !currentSuggestion) return;

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching parent handlers
        acceptSuggestion();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestion(false);
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestion, currentSuggestion, triggerStartPos]);

  const acceptSuggestion = () => {
    if (!currentSuggestion || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;

    // Replace the trigger text with the replacement
    const beforeTrigger = content.substring(0, triggerStartPos);
    const afterCursor = content.substring(cursorPos);
    const newContent =
      beforeTrigger + currentSuggestion.replacement + afterCursor;

    onContentChange(newContent);
    setShowSuggestion(false);

    // Set cursor position after the replacement
    setTimeout(() => {
      const newCursorPos =
        triggerStartPos + currentSuggestion.replacement.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!showSuggestion || !currentSuggestion) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-blue-500 rounded-lg shadow-lg px-3 py-2"
      style={{
        top: `${suggestionPosition.top}px`,
        left: `${suggestionPosition.left}px`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 font-mono">
          {currentSuggestion.display}
        </span>
        <span className="text-xs text-gray-500">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Enter
          </kbd>{" "}
          or{" "}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Tab
          </kbd>
        </span>
      </div>
    </div>
  );
}
