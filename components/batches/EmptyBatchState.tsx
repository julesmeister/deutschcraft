interface EmptyBatchStateProps {
  hasSearchQuery: boolean;
  onCreateClick: () => void;
}

export function EmptyBatchState({ hasSearchQuery, onCreateClick }: EmptyBatchStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {hasSearchQuery ? 'No batches found' : 'No batches yet'}
      </h3>
      <p className="text-gray-600 mb-6">
        {hasSearchQuery ? 'Try a different search term' : 'Create your first batch to get started'}
      </p>
      {!hasSearchQuery && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center font-black text-[14px] py-2 pl-5 pr-2 rounded-full bg-piku-purple text-white hover:bg-opacity-90 transition-colors"
        >
          <span>Create First Batch</span>
          <span className="ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-white text-piku-purple">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
