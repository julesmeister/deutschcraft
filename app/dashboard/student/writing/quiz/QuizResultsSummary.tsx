interface QuizResultsSummaryProps {
  totalPoints: number;
  correctCount: number;
  totalCount: number;
}

export function QuizResultsSummary({
  totalPoints,
  correctCount,
  totalCount
}: QuizResultsSummaryProps) {
  const accuracy = Math.round((correctCount / totalCount) * 100);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Quiz Complete!</h4>
            <p className="text-xs text-gray-600">
              You earned {totalPoints} points • {correctCount}/{totalCount} correct ({accuracy}% accuracy)
            </p>
          </div>
          <div className="text-3xl">
            {correctCount === totalCount ? '🎉' : '💪'}
          </div>
        </div>
      </div>
    </div>
  );
}
