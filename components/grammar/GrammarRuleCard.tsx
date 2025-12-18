'use client';

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

interface RuleProgress {
  practiced: number;
  total: number;
  completed: number;
  percentage: number;
}

interface GrammarRuleCardProps {
  rule: GrammarRule;
  progress: RuleProgress;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
  onClick: () => void;
}

export function GrammarRuleCard({ rule, progress, colorScheme, onClick }: GrammarRuleCardProps) {
  return (
    <div
      className={`group ${colorScheme.bg} px-6 py-4 transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
            {rule.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {rule.description}
          </p>

          {/* Progress Bar - only show if practiced */}
          {progress.practiced > 0 && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="font-medium">
                {progress.completed} mastered
              </span>
              <div className="flex-1 max-w-xs bg-gray-200 h-1.5">
                <div
                  className="bg-blue-600 h-1.5 transition-all"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <span className="font-medium">{progress.percentage}%</span>
            </div>
          )}
        </div>

        {/* Action Badge and Count */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Practice Count Badge */}
          {progress.total > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600">
              {progress.practiced}/{progress.total}
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}>
            {progress.practiced === 0 ? 'START' : progress.practiced === progress.total ? 'REVIEW' : 'CONTINUE'}
          </span>
        </div>
      </div>
    </div>
  );
}
