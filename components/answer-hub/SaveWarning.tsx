interface SaveWarningProps {
  exerciseId: string;
  userId: string | null;
  userName: string | null;
}

export function SaveWarning({ exerciseId, userId, userName }: SaveWarningProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 mb-4">
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-amber-800 font-semibold mb-1">
            Answer saving is disabled
          </p>
          <p className="text-xs text-amber-700">
            {!exerciseId && "Exercise ID is missing. "}
            {!userId && !userName && "Please log in to save your answers. "}
            You can still type your answers for practice.
          </p>
        </div>
      </div>
    </div>
  );
}
