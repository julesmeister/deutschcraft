interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatItem({ label, value, highlight = false }: StatItemProps) {
  return (
    <div>
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className={`ml-2 ${highlight ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
        {value}
      </span>
    </div>
  );
}

interface LevelInfoCardProps {
  level: string;
  description: string;
  baseWeeks: number;
  adjustedTotalWeeks: string;
  hoursPerDay: number;
  grammarCount: number;
  vocabularyCount: number;
  communicationCount: number;
}

export function LevelInfoCard({
  level,
  description,
  baseWeeks,
  adjustedTotalWeeks,
  hoursPerDay,
  grammarCount,
  vocabularyCount,
  communicationCount,
}: LevelInfoCardProps) {
  const totalStudyHours = Math.ceil(baseWeeks * 7 * hoursPerDay);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-5xl">📚</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{level}</h2>
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <StatItem
              label="Base Duration"
              value={`${baseWeeks} weeks (1 hr/day)`}
            />
            <StatItem
              label="Your Timeline"
              value={`${adjustedTotalWeeks} (${hoursPerDay} hr${hoursPerDay !== 1 ? 's' : ''}/day)`}
              highlight
            />
            <StatItem
              label="Grammar Topics"
              value={`${grammarCount} topics`}
            />
            <StatItem
              label="Vocabulary Themes"
              value={`${vocabularyCount} themes`}
            />
            <StatItem
              label="Communication Skills"
              value={`${communicationCount} skills`}
            />
            <StatItem
              label="Total Study Time"
              value={`~${totalStudyHours} hours`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
