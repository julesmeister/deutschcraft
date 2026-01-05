"use client";

import { useRef } from "react";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

export function InlineAnswerInput({
  value,
  onValueChange,
  onKeyDown,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  className: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={className}
      />
      <GermanCharAutocomplete
        textareaRef={inputRef}
        content={value}
        onContentChange={onValueChange}
      />
    </div>
  );
}
