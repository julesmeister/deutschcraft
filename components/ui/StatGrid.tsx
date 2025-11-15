interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

interface StatGridProps {
  title?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function StatItem({ label, value, unit }: StatItemProps) {
  return (
    <div className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="mt-2 flex items-baseline gap-x-2">
        <span className="text-4xl font-semibold tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}

export function StatGrid({ title, children, headerContent }: StatGridProps) {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {(title || headerContent) && (
        <>
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
            {headerContent && <div>{headerContent}</div>}
          </div>
          <div className="h-px bg-white/5" />
        </>
      )}
      <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
