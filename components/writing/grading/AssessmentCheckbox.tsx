/**
 * AssessmentCheckbox Component
 * Reusable checkbox for assessment criteria
 */

interface AssessmentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  color?: 'blue' | 'amber';
}

export function AssessmentCheckbox({
  checked,
  onChange,
  label,
  description,
  color = 'blue',
}: AssessmentCheckboxProps) {
  const colorClass = color === 'blue' ? 'text-blue-600' : 'text-amber-600';
  const ringClass = color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 w-4 h-4 ${colorClass} rounded ${ringClass} focus:ring-2`}
      />
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </label>
  );
}
