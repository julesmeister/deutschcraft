/**
 * TabButton Component
 * Reusable tab button for feedback workspace
 */

interface TabButtonProps {
  label: string;
  active: boolean;
  badge?: string;
  count?: number;
  onClick: () => void;
}

export function TabButton({ label, active, badge, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      {badge && <span className="ml-1 text-xs">{badge}</span>}
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </button>
  );
}
