/**
 * EmailWritingForm Component
 * Email composition interface with To, Subject, and Body fields
 */

import { EmailTemplate } from '@/lib/data/emailTemplates';

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
}

export function EmailWritingForm({
  template,
  emailContent,
  wordCount,
  onChange
}: EmailWritingFormProps) {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="space-y-4">
          {/* To Field */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              To (An):
            </label>
            <input
              type="text"
              value={emailContent.to}
              onChange={(e) => onChange({ ...emailContent, to: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recipient name or title"
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Subject (Betreff):
            </label>
            <input
              type="text"
              value={emailContent.subject}
              onChange={(e) => onChange({ ...emailContent, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject"
            />
          </div>

          {/* Body Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-neutral-700">
                Message (Nachricht):
              </label>
              <span className={`text-sm font-medium ${
                wordCount < template.minWords ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {wordCount} / {template.minWords}+ words
              </span>
            </div>
            <textarea
              value={emailContent.body}
              onChange={(e) => onChange({ ...emailContent, body: e.target.value })}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              placeholder="Start writing your email here..."
              style={{ lineHeight: '1.8' }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Email Writing Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use appropriate greetings and closings for the context</li>
          <li>• Keep paragraphs short and focused</li>
          <li>• Be clear and concise in your communication</li>
          <li>• Proofread for grammar and spelling before submitting</li>
        </ul>
      </div>
    </>
  );
}
