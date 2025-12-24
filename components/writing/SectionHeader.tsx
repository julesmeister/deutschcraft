/**
 * SectionHeader Component
 * Reusable header for writing submission sections
 */

interface SectionHeaderProps {
  icon?: string;
  label: string;
  labelColor?: string;
  badge?: string;
  badgeColor?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  icon,
  label,
  labelColor = 'text-gray-500',
  badge,
  badgeColor = 'text-gray-500',
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
          {label}
        </h3>
        {badge && (
          <span className={`text-xs font-normal ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
