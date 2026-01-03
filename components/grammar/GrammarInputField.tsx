import { RefObject } from "react";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

interface GrammarInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

export function GrammarInputField({
  value,
  onChange,
  onSubmit,
  inputRef,
}: GrammarInputFieldProps) {
  return (
    <div className="mb-6 relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue.length === 1) {
            onChange(newValue.charAt(0).toUpperCase());
          } else {
            onChange(newValue);
          }
        }}
        placeholder="Type your answer in German..."
        className="w-full px-4 py-3 text-lg border-2 border-gray-300 focus:outline-none focus:border-blue-600 transition-colors"
        onKeyPress={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSubmit();
          }
        }}
      />
      <GermanCharAutocomplete
        textareaRef={inputRef}
        content={value}
        onContentChange={onChange}
      />
    </div>
  );
}
