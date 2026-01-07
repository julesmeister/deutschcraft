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
    border: string;
  };
  onClick: () => void;
  onView?: () => void;
  onRetryMistakes?: () => void;
  hasMistakes?: boolean;
  dueCount?: number;
}

export function GrammarRuleCard({ rule, progress, colorScheme, onClick, onView, onRetryMistakes, hasMistakes, dueCount }: GrammarRuleCardProps) {
  return (
    <div
      className={`group ${colorScheme.bg} border-l-4 border-l-transparent px-6 py-4 transition-[background-color,border-color,padding] duration-300 ease-out ${colorScheme.border} hover:pl-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-all duration-500 ease-out mb-1`}>
            {rule.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 transition-colors duration-500 ease-out group-hover:text-gray-700">
            {rule.description}
          </p>

          {/* Progress Bar - only show if practiced */}
          {progress.practiced > 0 && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="font-medium transition-all duration-500 ease-out group-hover:text-gray-800">
                {progress.completed} mastered
              </span>
              <div className="flex-1 max-w-xs bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <span className="font-medium transition-all duration-500 ease-out group-hover:text-gray-800">{progress.percentage}%</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Due Count Badge */}
          {dueCount !== undefined && dueCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-md opacity-0 animate-fade-in-up hover:bg-amber-200 transition-all duration-300 ease-out" style={{ animationFillMode: 'forwards' }}>
              {dueCount} due
            </span>
          )}

          {/* Practice Count Badge */}
          {progress.total > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-md transition-all duration-300 ease-out hover:bg-gray-200">
              {progress.practiced}/{progress.total}
            </span>
          )}

          {/* Retry Mistakes Button - only show if there are mistakes */}
          {hasMistakes && onRetryMistakes && (
            <button
              onClick={onRetryMistakes}
              className="inline-flex items-center px-3 py-1 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-500 hover:text-white transition-all duration-300 ease-out rounded-md hover:shadow-md"
            >
              RETRY
            </button>
          )}

          {/* View/Scan Button - ALWAYS SHOW */}
          {onView && (
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white transition-all duration-300 ease-out rounded-md hover:shadow-md"
            >
              VIEW
            </button>
          )}

          {/* Practice Button - ALWAYS SHOW */}
          <button
            onClick={onClick}
            className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 group-hover:text-white ${colorScheme.badge} transition-all duration-300 ease-out rounded-md hover:shadow-md`}
          >
            {progress.practiced === 0 ? 'START' : 'PRACTICE'}
          </button>
        </div>
      </div>
    </div>
  );
}
