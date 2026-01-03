interface FreestyleInstructionsProps {
  freestyleTopic?: string;
  isPublic?: boolean;
  viewingAttempt?: boolean;
  setFreestyleTopic?: (topic: string) => void;
  setIsPublic?: (isPublic: boolean) => void;
}

export function FreestyleInstructions({
  freestyleTopic,
  isPublic,
  viewingAttempt,
  setFreestyleTopic,
  setIsPublic,
}: FreestyleInstructionsProps) {
  return (
    <>
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          📝 Your Topic
        </h3>
        {!viewingAttempt && setFreestyleTopic ? (
          <div className="mb-4">
            <input
              type="text"
              value={freestyleTopic || ""}
              onChange={(e) => setFreestyleTopic(e.target.value)}
              placeholder="Enter your topic here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        ) : (
          <p className="text-base text-gray-900 leading-relaxed mb-4">
            {freestyleTopic || "No topic selected"}
          </p>
        )}

        {!viewingAttempt && setIsPublic && (
          <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block">
                Public Submission
              </span>
              <span className="text-xs text-gray-500">
                Allow other students to see your writing
              </span>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Write freely about your chosen topic</li>
          <li>• Use the public/private toggle to control visibility</li>
          <li>• Check grammar before submitting</li>
        </ul>
      </div>
    </>
  );
}
