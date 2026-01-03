export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function PostsLoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function NoUserWarning() {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">Please complete your profile to access social features.</p>
    </div>
  );
}

export function EmptyPostsState({ filterBatch }: { filterBatch: string }) {
  return (
    <div className="bg-white border border-gray-200 p-8 text-center">
      <h5 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h5>
      <p className="text-gray-500">
        {filterBatch === 'all'
          ? 'Be the first to share something in German!'
          : 'No posts found for the selected batch.'}
      </p>
    </div>
  );
}
