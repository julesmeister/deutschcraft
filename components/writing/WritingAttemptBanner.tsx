/**
 * WritingAttemptBanner Component
 * Dark-themed banner showing attempt number, status, and read-only indicator
 */

interface WritingAttemptBannerProps {
  attemptNumber: number;
  status: string;
}

export function WritingAttemptBanner({ attemptNumber, status }: WritingAttemptBannerProps) {
  return (
    <div className="flex items-center justify-between px-8 py-2.5 bg-gray-900 text-[11px]">
      <div className="flex items-center gap-2 text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="font-medium text-white">Attempt #{attemptNumber}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${
          status === 'reviewed' ? 'bg-green-400 text-black' :
          status === 'submitted' ? 'bg-yellow-400 text-black' :
          'bg-gray-300 text-black'
        }`}>
          {status === 'draft' ? 'Draft' :
           status === 'submitted' ? 'Awaiting Review' : 'Reviewed'}
        </span>
        <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide bg-white text-black">
          Read-only
        </span>
      </div>
    </div>
  );
}
