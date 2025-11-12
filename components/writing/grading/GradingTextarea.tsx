/**
 * GradingTextarea Component
 * Reusable borderless textarea with gray background
 */

interface GradingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  className?: string;
}

export function GradingTextarea({
  value,
  onChange,
  placeholder,
  rows = 6,
  className = '',
}: GradingTextareaProps) {
  const height = rows === 6 ? 'h-32' : rows === 3 ? 'h-20' : 'h-24';

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full ${height} p-3 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 resize-none text-sm transition-colors ${className}`}
    />
  );
}
