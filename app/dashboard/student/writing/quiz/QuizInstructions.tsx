interface QuizInstructionsProps {
  showResults: boolean;
}

export function QuizInstructions({ showResults }: QuizInstructionsProps) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Instructions</h3>
          <p className="text-sm text-gray-600">
            Fill in all the blanks with the correct words from your corrected writing exercises.
            {!showResults && ' Click "Check Answers" when you\'re done.'}
          </p>
        </div>
      </div>
    </div>
  );
}
