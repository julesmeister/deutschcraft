interface QuickAction {
  icon: string;
  label: string;
  count: string;
}

interface StudentQuickActionsProps {
  cardsReady: number;
  wordsToReview: number;
}

export function StudentQuickActions({ cardsReady, wordsToReview }: StudentQuickActionsProps) {
  const actions: QuickAction[] = [
    { icon: '📚', label: 'Practice', count: cardsReady > 0 ? `${cardsReady} cards ready` : 'No cards ready' },
    { icon: '✍️', label: 'Write', count: 'AI-powered' },
    { icon: '🔄', label: 'Review', count: wordsToReview > 0 ? `${wordsToReview} words` : 'All caught up!' },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {actions.map((action, i) => (
        <div key={i} className="bg-white border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">{action.icon}</div>
          <p className="text-sm font-bold uppercase text-gray-900 mb-1">{action.label}</p>
          <p className="text-xs text-gray-500 mb-4">{action.count}</p>
          <button className="w-full border border-gray-900 py-2 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition">
            Start
          </button>
        </div>
      ))}
    </div>
  );
}
