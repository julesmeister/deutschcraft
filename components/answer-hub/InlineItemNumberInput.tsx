"use client";

import { useRef } from "react";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

export function InlineItemNumberInput({
  value,
  onValueChange,
  onClick,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onClick?: () => void;
  placeholder: string;
  className: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onClick={onClick}
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
