import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface GrammarAnswerComparisonProps {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  hints?: string[];
  onRetry: () => void;
}

export function GrammarAnswerComparison({
  userAnswer,
  correctAnswer,
  isCorrect,
  hints,
  onRetry,
}: GrammarAnswerComparisonProps) {
  return (
    <div className="mb-6">
      <div className="space-y-4">
        {/* Your Answer */}
        <div
          className={`p-4 ${isCorrect ? "bg-emerald-100" : "bg-pink-100"}`}
        >
          <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
            Your Answer
          </h5>
          <div className="px-3 py-2 bg-white border border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {userAnswer || "(no answer)"}
            </p>
          </div>
        </div>

        {/* Correct Answer */}
        {!isCorrect && (
          <div className="p-4 bg-blue-100">
            <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
              Correct Answer
            </h5>
            <div className="px-3 py-2 bg-white border border-gray-200">
              <p className="text-sm font-bold text-gray-900">{correctAnswer}</p>
            </div>
          </div>
        )}

        {/* Result Icon */}
        <div className="text-center py-4">
          {isCorrect ? (
            <div className="inline-flex items-center gap-2 text-green-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xl font-bold">Correct!</span>
            </div>
          ) : (
            <div className="max-w-xs mx-auto">
              <ActionButton
                onClick={onRetry}
                icon={<ActionButtonIcons.ArrowRight />}
                variant="orange"
              >
                Retry This Sentence
              </ActionButton>
            </div>
          )}
        </div>
      </div>

      {/* Hints */}
      {hints && hints.length > 0 && (
        <div className="p-4 bg-amber-100">
          <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
            💡 Hints
          </h5>
          <div className="space-y-2">
            {hints.map((hint, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-white border border-gray-200"
              >
                <span className="text-sm text-gray-900">{hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
