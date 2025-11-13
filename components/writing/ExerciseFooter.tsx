/**
 * ExerciseFooter Component
 * Shared footer component for all writing exercise cards
 */

interface ExerciseFooterProps {
  left: string | number;
  right?: string | number;
}

export function ExerciseFooter({ left, right }: ExerciseFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}
