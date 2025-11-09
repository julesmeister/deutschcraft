import { CEFRLevel } from '@/lib/models';

interface LevelDistributionProps {
  students: Array<{ level: string }>;
  levelColors: Record<CEFRLevel, string>;
}

export function LevelDistribution({ students, levelColors }: LevelDistributionProps) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
          Level Distribution
        </h5>
      </div>
      <div className="p-4 space-y-3">
        {Object.values(CEFRLevel).map((level) => {
          const count = students.filter((s) => s.level === level).length;
          const percentage = students.length > 0 ? (count / students.length) * 100 : 0;

          return (
            <div key={level}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-900">{level}</span>
                <span className="text-sm text-gray-600">{count} students</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${levelColors[level]} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
