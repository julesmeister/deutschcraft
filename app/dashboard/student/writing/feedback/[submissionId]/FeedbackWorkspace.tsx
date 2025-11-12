/**
 * FeedbackWorkspace Component
 * 2-column layout for viewing submission and feedback
 */

import { ReactNode } from 'react';
import { WritingSubmission } from '@/lib/models/writing';

interface FeedbackWorkspaceProps {
  submission: WritingSubmission;
  feedbackPanel: ReactNode;
}

export function FeedbackWorkspace({ submission, feedbackPanel }: FeedbackWorkspaceProps) {
  return (
    <div className="bg-white min-h-[600px] flex">
      {/* LEFT: Your Submission */}
      <div className="flex-1 p-8 flex flex-col">
        {/* Submission Metadata */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium">
            <span className="text-gray-900">{submission.wordCount}</span>
            <span className="text-gray-400 mx-1">words</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${
              submission.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
              submission.status === 'reviewed' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {submission.status}
            </span>
            {submission.submittedAt && (
              <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Submission Content */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-2xl text-gray-900 leading-relaxed whitespace-pre-wrap"
             style={{
               lineHeight: '1.6',
               fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
             }}>
            {submission.content}
          </p>
        </div>
      </div>

      {/* SEPARATOR */}
      <div className="w-px bg-gray-200" />

      {/* RIGHT: Feedback Panel */}
      {feedbackPanel}
    </div>
  );
}
