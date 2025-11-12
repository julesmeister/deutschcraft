/**
 * GradingInput Component
 * Reusable borderless input field with gray background
 */

interface GradingInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function GradingInput({
  value,
  onChange,
  placeholder,
  className = '',
}: GradingInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-2.5 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 text-sm transition-colors ${className}`}
    />
  );
}
