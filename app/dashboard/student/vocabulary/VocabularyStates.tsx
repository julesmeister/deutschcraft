import { CatLoader } from "@/components/ui/CatLoader";

export function LoadingState() {
  return (
    <div className="p-12 flex justify-center">
      <CatLoader message="Loading vocabulary..." size="md" />
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="p-12 text-center">
      <div className="text-4xl mb-4">😢</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Unable to load vocabulary
      </h3>
      <p className="text-gray-500 mb-4">
        There was a problem loading the vocabulary data.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="p-12 text-center">
      <svg
        className="mx-auto w-16 h-16 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No results found
      </h3>
      <p className="text-gray-500">
        Try adjusting your search or filters
      </p>
    </div>
  );
}
