import { SRSStats } from "@/lib/services/writing/markedWordQuizService";

interface SRSStatsDisplayProps {
  stats: SRSStats;
  className?: string;
  variant?: "dark" | "light";
}

export function SRSStatsDisplay({
  stats,
  className = "",
  variant = "dark",
}: SRSStatsDisplayProps) {
  const totalWaiting = Object.values(stats.waiting).reduce((a, b) => a + b, 0);

  const labelColor = variant === "dark" ? "text-gray-400" : "text-gray-500";
  const valueColor = variant === "dark" ? "text-white" : "text-gray-900";
  const subLabelColor = variant === "dark" ? "text-gray-400" : "text-gray-500";
  const textColor = variant === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="text-right hidden sm:block">
        <div
          className={`text-xs font-medium uppercase tracking-wider mb-1 ${labelColor}`}
        >
          Scheduled
        </div>
        <div className={`text-sm ${textColor}`}>{totalWaiting} words</div>
      </div>
      <div className="flex items-center gap-3">
        {Object.entries(stats.waiting).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className={`text-lg font-bold leading-none ${valueColor}`}>
              {value}
            </div>
            <div className={`text-[10px] font-medium ${subLabelColor}`}>
              {key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
