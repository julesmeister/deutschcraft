"use client";

import { useRef } from "react";
import { X } from "lucide-react";
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
    <div className="flex-1 relative group">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`${className} pr-8`}
      />
      {value && (
        <button
          onClick={() => {
            onValueChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          tabIndex={-1}
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <GermanCharAutocomplete
        textareaRef={inputRef}
        content={value}
        onContentChange={onValueChange}
      />
    </div>
  );
}
