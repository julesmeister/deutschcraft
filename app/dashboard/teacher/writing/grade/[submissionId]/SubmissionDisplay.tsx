/**
 * SubmissionDisplay Component
 * Displays student submission with optional reference/corrected version
 */

interface SubmissionDisplayProps {
  submission: {
    content: string;
    exerciseType: string;
    wordCount: number;
    version: number;
    submittedAt?: number;
    userId: string;
  };
  userName?: string;
  referenceTranslation?: string;
  correctedVersion: string;
  onCorrectedVersionChange: (value: string) => void;
}

export function SubmissionDisplay({
  submission,
  userName,
  referenceTranslation,
  correctedVersion,
  onCorrectedVersionChange,
}: SubmissionDisplayProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Student Info Header */}
      <div className="px-8 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Student</div>
            <div className="font-medium text-gray-900">
              {userName || submission.userId}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Submitted</div>
            <div className="font-medium text-gray-900">
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not submitted yet'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Words</div>
            <div className="font-medium text-gray-900">{submission.wordCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Version</div>
            <div className="font-medium text-gray-900">v{submission.version}</div>
          </div>
        </div>
      </div>

      {/* Student's Writing Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Student's Original Answer */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Student's Answer
            </div>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
              {submission.content}
            </p>
          </div>
        </div>

        {/* Reference Translation (for translation exercises) OR Corrected Version (for creative exercises) */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {submission.exerciseType === 'translation' ? 'Reference Translation' : 'Corrected Version (Optional)'}
            </div>
            {submission.exerciseType !== 'translation' && !correctedVersion && (
              <button
                onClick={() => onCorrectedVersionChange(submission.content)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy student's text
              </button>
            )}
          </div>
          {submission.exerciseType === 'translation' ? (
            // Show reference translation (read-only)
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
                {referenceTranslation || 'Loading reference translation...'}
              </p>
            </div>
          ) : (
            // Show editable textarea for creative exercises
            <textarea
              value={correctedVersion}
              onChange={(e) => onCorrectedVersionChange(e.target.value)}
              placeholder="Type or paste the grammatically correct version here..."
              className="w-full min-h-[200px] text-lg leading-relaxed text-gray-900 bg-transparent border-none focus:outline-none resize-y placeholder:text-gray-400"
              style={{ fontFamily: 'inherit' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
