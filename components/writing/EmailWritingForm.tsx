/**
 * EmailWritingForm Component
 * Uses reusable WritingWorkspace component
 */

import { ReactNode } from 'react';
import { EmailTemplate } from '@/lib/data/emailTemplates';
import { WritingWorkspace, EmailField } from './WritingWorkspace';

interface EmailContent {
  to: string;
  subject: string;
  body: string;
}

interface EmailWritingFormProps {
  template: EmailTemplate;
  emailContent: EmailContent;
  wordCount: number;
  onChange: (content: EmailContent) => void;
  attemptCount?: number;
  attemptHistory?: ReactNode;
  readOnly?: boolean;
  viewingAttempt?: { attemptNumber: number; status: string };
}

export function EmailWritingForm({
  template,
  emailContent,
  wordCount,
  onChange,
  attemptCount,
  attemptHistory,
  readOnly,
  viewingAttempt
}: EmailWritingFormProps) {
  const topIndicator = (
    <div className="text-sm font-medium">
      <span className={wordCount < template.minWords ? 'text-amber-600' : 'text-emerald-600'}>
        {wordCount}
      </span>
      <span className="text-gray-400 mx-1">/</span>
      <span className="text-gray-500">{template.minWords}+ words</span>
    </div>
  );

  const additionalFields = (
    <>
      <EmailField
        label="To (An)"
        value={emailContent.to}
        onChange={(value) => onChange({ ...emailContent, to: value })}
        placeholder="Recipient name or title"
      />
      <EmailField
        label="Subject (Betreff)"
        value={emailContent.subject}
        onChange={(value) => onChange({ ...emailContent, subject: value })}
        placeholder="Email subject"
      />
    </>
  );

  const instructions = (
    <>
      {/* Key Phrases */}
      {template.keyPhrases && template.keyPhrases.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">🔑 Key Phrases</h4>
          <div className="space-y-2">
            {template.keyPhrases.map((phrase, idx) => (
              <div key={idx} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                {phrase}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Writing Tips */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Use appropriate greetings and closings</li>
          <li>• Keep paragraphs short and focused</li>
          <li>• Be clear and concise</li>
          <li>• Proofread before submitting</li>
        </ul>
      </div>
    </>
  );

  return (
    <WritingWorkspace
      value={emailContent.body}
      onChange={(value) => onChange({ ...emailContent, body: value })}
      placeholder="Start writing your email here..."
      topIndicator={topIndicator}
      additionalFields={additionalFields}
      instructions={instructions}
      attemptCount={attemptCount}
      attemptHistory={attemptHistory}
      readOnly={readOnly}
      viewingAttempt={viewingAttempt}
    />
  );
}
