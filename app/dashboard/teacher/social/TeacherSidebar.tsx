interface TeachingImpactProps {
  stats: {
    postsCount: number;
    suggestionsGiven: number;
    suggestionsReceived: number;
    acceptanceRate: number;
  };
}

export function TeachingImpact({ stats }: TeachingImpactProps) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-900">Your Teaching Impact</h5>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Posts Created:</span>
          <strong className="text-blue-600">{stats.postsCount}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Corrections Given:</span>
          <strong className="text-green-600">{stats.suggestionsGiven}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Corrections Received:</span>
          <strong className="text-cyan-600">{stats.suggestionsReceived}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Acceptance Rate:</span>
          <strong className="text-amber-600">{stats.acceptanceRate.toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
}

export function CommonMistakes() {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-900">Common Mistakes</h5>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">
          Track patterns across student posts to identify areas needing focus.
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Article usage (der/die/das)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-red-600 h-1 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Verb conjugation</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-amber-600 h-1 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Word order</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-cyan-600 h-1 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeachingTips() {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-900">Teaching Tips</h5>
      </div>
      <div className="p-4">
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">👨‍🏫</span>
            <span>Focus on constructive feedback</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📚</span>
            <span>Reference grammar rules in suggestions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Prioritize common error patterns</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💬</span>
            <span>Encourage peer-to-peer learning</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
